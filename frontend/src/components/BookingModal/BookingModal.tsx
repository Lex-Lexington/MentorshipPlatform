import React, { useState } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import './BookingModal.css';

interface BookingModalProps {
  mentor: User;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * BookingModal — modal form for booking a mentorship session.
 * Includes date/time selection, loading states, and error handling.
 */
const BookingModal: React.FC<BookingModalProps> = ({ mentor, onClose, onSuccess }) => {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Use a hardcoded mentee ID for demo purposes
  const DEMO_MENTEE_ID = 'demo-mentee-001';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!date || !time) {
      setError('Please select both a date and time.');
      return;
    }

    const scheduledAt = new Date(`${date}T${time}`).toISOString();
    const now = new Date().toISOString();

    if (scheduledAt <= now) {
      setError('Please select a future date and time.');
      return;
    }

    setLoading(true);

    try {
      await api.createSession({
        mentorId: mentor.id,
        menteeId: DEMO_MENTEE_ID,
        scheduledAt,
      });

      setSuccessMessage('Session booked successfully! 🎉');

      // Auto-close after a short delay
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book session.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Get tomorrow's date as the minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="booking-modal__overlay" onClick={onClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <button className="booking-modal__close" onClick={onClose} aria-label="Close modal">
          &times;
        </button>

        <div className="booking-modal__header">
          <h2 className="booking-modal__title">Book a Session</h2>
          <p className="booking-modal__subtitle">
            Schedule a mentorship session with <strong>{mentor.name}</strong>
          </p>
        </div>

        <div className="booking-modal__mentor-info">
          <div className="booking-modal__avatar">
            {mentor.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <div>
            <p className="booking-modal__mentor-name">{mentor.name}</p>
            <div className="booking-modal__mentor-skills">
              {mentor.skills.slice(0, 3).map((skill) => (
                <span key={skill} className="booking-modal__skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <form className="booking-modal__form" onSubmit={handleSubmit}>
          <div className="booking-modal__field">
            <label htmlFor="session-date">Date</label>
            <input
              id="session-date"
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="booking-modal__field">
            <label htmlFor="session-time">Time</label>
            <input
              id="session-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="booking-modal__error" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="booking-modal__success" role="status">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            className="booking-modal__submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="booking-modal__spinner" />
            ) : (
              'Confirm Booking'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
