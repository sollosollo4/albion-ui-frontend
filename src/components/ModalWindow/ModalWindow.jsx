import React, { useState } from 'react';
import "./modal.css";

const ModalWindow = ({isModalOpen, closeModal}) => {
  return (
    <div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Заголовок модального окна</h2>
            <p>Содержимое модального окна</p>
            <button onClick={closeModal}>Закрыть модальное окно</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModalWindow;