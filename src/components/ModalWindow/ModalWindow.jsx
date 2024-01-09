import React from 'react';
import './modal.css'; // Подключите стили для модального окна

class ModalWindow extends React.Component {
  constructor(props) {
    super(props);
    this.modalRef = React.createRef();
  }

  handleOutsideClick = (event) => {
    if (this.modalRef.current && !this.modalRef.current.contains(event.target)) {
      // Если клик произошел вне области модального окна, вызываем closeModal
      this.props.closeModal();
    }
  };

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }

  render() {
    const { isModalOpen, children } = this.props;

    return (
      <div>
        {isModalOpen && (
          <div className="modal-overlay">
            <div className="modal" ref={this.modalRef}>
              <div>{children}</div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default ModalWindow;