import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { Draggable } from './Draggable';
import { Droppable } from './Droppable';
import { db, doc, setDoc, getDoc } from './firebase';
import './App.css';

const elements = [
  { id: 'heading', type: 'heading', content: 'Heading' },
  { id: 'paragraph', type: 'paragraph', content: 'This is a paragraph.' },
  { id: 'image', type: 'image', content: 'Image URL', src: 'https://via.placeholder.com/150' },
  { id: 'label', type: 'label', content: 'Label' },
  { id: 'button', type: 'button', content: 'Button' },
  { id: 'input', type: 'input', content: 'Input' },
  { id: 'grid', type: 'grid', content: 'Grid' },
  { id: 'list', type: 'list', content: 'List', items: ['Item 1', 'Item 2', 'Item 3'] },
  { id: 'divider', type: 'divider', content: 'Divider' },
];

function CraftPage({ mode }) {
  const [droppedElements, setDroppedElements] = useState([]);
  const [draggableElements, setDraggableElements] = useState(elements);
  const [pageId, setPageId] = useState(null);

  useEffect(() => {
    if (mode === 'edit') {
      const fetchPageData = async () => {
        const docRef = doc(db, 'pages', 'my-page'); 
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDroppedElements(docSnap.data().elements || []);
        }
      };
      fetchPageData();
    }
  }, [mode]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.action === 'createNewCanvas') {
        setDroppedElements([]);
      } else if (event.data.action === 'editCurrentCanvas') {
        
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over) {
      const existingElement = draggableElements.find((el) => el.id === active.id);
      setDroppedElements((prev) => [
        ...prev,
        { ...existingElement, id: `${existingElement.id}-${prev.length}` },
      ]);
    }
  };

  const handleTextChange = (id, newText, isDraggable = false) => {
    const setElements = isDraggable ? setDraggableElements : setDroppedElements;
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, content: newText, isEditing: false } : el)));
  };

  const handleInputChange = (id, newValue) => {
    setDroppedElements((prev) => prev.map((el) => (el.id === id ? { ...el, value: newValue } : el)));
  };

  const handleButtonClick = (id) => {
    alert(`Button ${id} clicked!`);
  };

  const handleListChange = (id, newItem, index) => {
    setDroppedElements((prev) => prev.map((el) =>
      el.id === id ? { ...el, items: el.items.map((item, i) => (i === index ? newItem : item)) } : el
    ));
  };

  const handleImageChange = (id, newSrc) => {
    setDroppedElements((prev) => prev.map((el) => (el.id === id ? { ...el, src: newSrc } : el)));
  };

  const toggleEdit = (id, isDraggable = false) => {
    const setElements = isDraggable ? setDraggableElements : setDroppedElements;
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, isEditing: !el.isEditing } : el)));
  };

  const handleDelete = (id) => {
    setDroppedElements((prev) => prev.filter((el) => el.id !== id));
  };

  const publishCanvas = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write('<html><head><title>Published Page</title>');
      newWindow.document.write('<style>');
      newWindow.document.write(`
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          padding: 20px;
          background-color: #f0f0f0;
        }
        h1, h2, h3, h4, h5, h6 {
          color: #333;
          margin: 10px 0;
        }
        p {
          color: #666;
          margin: 10px 0;
        }
        button {
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 20px;
          cursor: pointer;
          margin: 10px 0;
          display: inline-block;
        }
        button:hover {
          background-color: #0056b3;
        }
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 10px 0;
        }
        ul {
          list-style: disc;
          padding-left: 20px;
          margin: 10px 0;
        }
        .grid {
          display: flex;
          gap: 10px;
          margin: 10px 0;
        }
        .grid-item {
          background: #f4f4f4;
          padding: 10px;
          border: 1px solid #ddd;
          flex: 1;
        }
        hr {
          border: 1px solid #ddd;
          margin: 20px 0;
          width: 100%;
        }
        .list-item {
          margin: 5px 0;
        }
        .editable-text {
          cursor: pointer;
          margin: 5px 0;
        }
        .button-container {
          margin: 20px 0;
          display: flex;
          gap: 20px;
        }
      `);
      newWindow.document.write('</style>');
      newWindow.document.write('</head><body>');
      newWindow.document.write('<div class="button-container">');
      newWindow.document.write('<button onclick="createNewCanvas()">Create New Canvas</button>');
      newWindow.document.write('<button onclick="editCurrentCanvas()">Edit Current Canvas</button>');
      newWindow.document.write('</div>');
      droppedElements.forEach((element) => {
        switch (element.type) {
          case 'label':
          case 'heading':
          case 'paragraph':
            newWindow.document.write(`<${element.type} style="margin: 10px 0;">${element.content}</${element.type}>`);
            break;
          case 'input':
            newWindow.document.write(`<input type="text" placeholder="${element.content}" style="margin: 10px 0; width: 100%;" />`);
            break;
          case 'button':
            newWindow.document.write(`<button style="margin: 10px 0;">${element.content}</button>`);
            break;
          case 'image':
            newWindow.document.write(`<img src="${element.src}" alt="Image" style="margin: 10px 0;" />`);
            break;
          case 'list':
            newWindow.document.write('<ul>');
            element.items.forEach((item) => {
              newWindow.document.write(`<li class="list-item">${item}</li>`);
            });
            newWindow.document.write('</ul>');
            break;
          case 'grid':
            newWindow.document.write('<div class="grid">');
            for (let i = 0; i < 3; i++) {
              newWindow.document.write('<div class="grid-item">Grid Item</div>');
            }
            newWindow.document.write('</div>');
            break;
          case 'divider':
            newWindow.document.write('<hr />');
            break;
          default:
            break;
        }
      });
      newWindow.document.write('</body></html>');
      newWindow.document.write(`
        <script>
          function createNewCanvas() {
            window.opener.postMessage({ action: 'createNewCanvas' }, '*');
            window.close();
          }
  
          function editCurrentCanvas() {
            window.opener.postMessage({ action: 'editCurrentCanvas' }, '*');
            window.close();
          }
        </script>
      `);
      newWindow.document.close();
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
      <div id="root">
        <div className="container">
          <div className="sidebar">
            <h2>Layout Items</h2>
            {draggableElements.map((element) => (
              <Draggable key={element.id} id={element.id}>
                {element.type === 'label' || element.type === 'heading' || element.type === 'paragraph' ? (
                  element.isEditing ? (
                    <input
                      type="text"
                      value={element.content}
                      onChange={(e) => handleTextChange(element.id, e.target.value, true)}
                      onBlur={() => toggleEdit(element.id, true)}
                      autoFocus
                      className="editable-input"
                    />
                  ) : (
                    <span onDoubleClick={() => toggleEdit(element.id, true)} className="draggable-item">
                      {element.content}
                    </span>
                  )
                ) : (
                  <div className="draggable-item">
                    {element.content}
                  </div>
                )}
              </Draggable>
            ))}
          </div>
          <div className="droppable-area">
            <div className="droppable-header">
              <h2>Design Space</h2>
              <button onClick={publishCanvas} className="button save-button">Publish</button>
            </div>
            <Droppable>
              {droppedElements.map((element) => (
                <div key={element.id} className="droppable-item">
                  {element.type === 'label' || element.type === 'heading' || element.type === 'paragraph' ? (
                    element.isEditing ? (
                      <input
                        type="text"
                        value={element.content}
                        onChange={(e) => handleTextChange(element.id, e.target.value)}
                        onBlur={() => toggleEdit(element.id)}
                        autoFocus
                        className="editable-input"
                      />
                    ) : (
                      <span onDoubleClick={() => toggleEdit(element.id)} className="editable-text">
                        {element.content}
                      </span>
                    )
                  ) : null}
                  {element.type === 'input' && (
                    <input
                      type="text"
                      placeholder="Input Field"
                      value={element.value || ''}
                      onChange={(e) => handleInputChange(element.id, e.target.value)}
                      className="editable-input"
                    />
                  )}
                  {element.type === 'button' && (
                    <button onClick={() => handleButtonClick(element.id)} className="button">
                      {element.content}
                    </button>
                  )}
                  {element.type === 'image' && (
                    <>
                      <input
                        type="text"
                        placeholder="Image URL"
                        value={element.src}
                        onChange={(e) => handleImageChange(element.id, e.target.value)}
                        className="editable-input"
                      />
                      <img src={element.src} alt="Draggable Image" className="image" />
                    </>
                  )}
                  {element.type === 'list' && (
                    <ul className="list">
                      {element.items.map((item, index) => (
                        <li key={index}>
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleListChange(element.id, e.target.value, index)}
                            className="editable-input"
                          />
                        </li>
                      ))}
                    </ul>
                  )}
                  {element.type === 'grid' && (
                    <div className="grid">
                      {[...Array(3)].map((_, index) => (
                        <div key={index} className="grid-item">
                          Grid Item
                        </div>
                      ))}
                    </div>
                  )}
                  {element.type === 'divider' && <hr />}
                  <button className="delete-button" onClick={() => handleDelete(element.id)}>X</button>
                </div>
              ))}
            </Droppable>
          </div>
        </div>
      </div>
    </DndContext>
  );
}

export default CraftPage;
