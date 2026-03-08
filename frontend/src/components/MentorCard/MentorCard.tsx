import React from 'react';
import { User } from '../../types';
import './MentorCard.css';

interface MentorCardProps {
  mentor: User;
  onBookSession: (mentor: User) => void;
}

/**
 * MentorCard — displays a single mentor's information.
 */
const MentorCard: React.FC<MentorCardProps> = ({ mentor, onBookSession }) => {
  // Generate avatar initials from the mentor's name
  const initials = mentor.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <article className="mentor-card">
      <div className="mentor-card__header">
        <div className="mentor-card__avatar">{initials}</div>
        <div className="mentor-card__info">
          <h3 className="mentor-card__name">{mentor.name}</h3>
          <span className="mentor-card__role">{mentor.role}</span>
        </div>
      </div>

      <p className="mentor-card__bio">{mentor.bio}</p>

      <div className="mentor-card__skills">
        {mentor.skills.map((skill) => (
          <span key={skill} className="mentor-card__skill-tag">
            {skill}
          </span>
        ))}
      </div>

      <button
        className="mentor-card__book-btn"
        onClick={() => onBookSession(mentor)}
      >
        Book Session
      </button>
    </article>
  );
};

export default MentorCard;
