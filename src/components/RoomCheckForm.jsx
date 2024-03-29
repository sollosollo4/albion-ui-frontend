import React, { useState } from 'react';
import axios from 'axios';

const RoomCheckForm = ({ onFormSubmit }) => {
  const [formData, setFormData] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://albion-overlay.ru/api/check', formData);
      onFormSubmit(response.data.data.roomId);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div><br />
      Создайте или присоединитесь к существующей комнате<br />
      <form onSubmit={handleSubmit} className='roomForm' onChange={handleChange}>
        <div>
          <label htmlFor="room_title">ID комнаты</label>
          <input type="text" name="room_title" />
          <br />
          <label htmlFor="password">Пароль</label>
          <input type="password" name="password" required />
          <br />
        </div>
        <button type="submit">Войти или создать</button>
      </form>
    </div>
  );
};

export default RoomCheckForm;