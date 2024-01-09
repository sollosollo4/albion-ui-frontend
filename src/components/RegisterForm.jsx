import React from 'react';
import axios from 'axios';

class RegisterForm extends React.Component {
  // Добавьте свою логику регистрации
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  handleUsernameChange = (e) => {
    this.username = e.target.value
  };
  handlePasswordChange = (e) => {
    this.password = e.target.value
  };

  handleRegister = async () => {
    await axios.post('https://albion-overlay.ru/api/login', {
      username: this.username,
      password: this.password
    }, {withCredentials: true})
    .then(response => {
      const cookies = response.headers['set-cookie'];
      console.log(cookies)
      /*const cookieArray = cookies.split(';');
      cookieArray.forEach(cookie => {
        document.cookie = cookie.trim();
      });*/

      console.log('Registration successful:', response.data);
      this.props.onFormSubmit(response.data);
      this.props.closeModal();
    })
    .catch(error => {
      console.error('Registration failed:', error.response.data);
      alert(error.response.data.message);
    });
  };

  render() {
    return (
      <form>
        <label>
          Имя пользователя:
          <input
            type="text"
            value={this.username}
            onChange={(e) => this.handleUsernameChange(e)}
          />
        </label>
        <br />
        <label>
          Пароль:
          <input
            type="password"
            value={this.password}
            onChange={(e) => this.handlePasswordChange(e)}
          />
        </label>
        <br />
        <button type="button" onClick={this.handleRegister}>
          Зарегистрироваться или войти
        </button>
      </form>
    );
  }
}

export default RegisterForm;