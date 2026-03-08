import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../../types';
import { api } from '../../services/api';
import { MentorCard } from '../../components/MentorCard';
import { SkillFilter } from '../../components/SkillFilter';
import { BookingModal } from '../../components/BookingModal';
import './MentorsPage.css';

/**
 * MentorsPage — main page that displays the Mentors Directory.
 * Fetches data from the API with dynamic skill filtering.
 */
const MentorsPage: React.FC = () => {
  const [mentors, setMentors] = useState<User[]>([]);
  const [allSkills, setAllSkills] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<User | null>(null);

  /**
   * Fetch mentors from the API, optionally filtered by selected skills.
   */
  const fetchMentors = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: { role: string; skills?: string } = { role: 'mentor' };

      if (selectedSkills.length > 0) {
        filters.skills = selectedSkills.join(',');
      }

      const response = await api.getUsers(filters);
      setMentors(response.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load mentors.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [selectedSkills]);

  /**
   * On initial load, fetch ALL mentors to extract the complete skill set.
   */
  useEffect(() => {
    const fetchAllSkills = async () => {
      try {
        const response = await api.getUsers({ role: 'mentor' });
        const skills = new Set<string>();
        response.data.forEach((user) => {
          user.skills.forEach((skill) => skills.add(skill.toLowerCase()));
        });
        setAllSkills(Array.from(skills).sort());
      } catch {
        // Skills will just be empty if this fails
      }
    };

    fetchAllSkills();
  }, []);

  /**
   * Re-fetch mentors whenever the selected skills change.
   */
  useEffect(() => {
    fetchMentors();
  }, [fetchMentors]);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleClearSkills = () => {
    setSelectedSkills([]);
  };

  const handleBookSession = (mentor: User) => {
    setSelectedMentor(mentor);
  };

  const handleCloseModal = () => {
    setSelectedMentor(null);
  };

  const handleBookingSuccess = () => {
    // Could refresh data or show a global notification
  };

  return (
    <div className="mentors-page">
      <header className="mentors-page__header">
        <div className="mentors-page__header-content">
          <h1 className="mentors-page__title">
            🎯 IT Mentorship Platform
          </h1>
          <p className="mentors-page__description">
            Find experienced mentors to accelerate your tech career. Browse
            profiles, filter by skills, and book 1-on-1 sessions.
          </p>
        </div>
      </header>

      <main className="mentors-page__content">
        <aside className="mentors-page__sidebar">
          <SkillFilter
            allSkills={allSkills}
            selectedSkills={selectedSkills}
            onToggleSkill={handleToggleSkill}
            onClearAll={handleClearSkills}
          />
        </aside>

        <section className="mentors-page__main">
          <div className="mentors-page__results-header">
            <h2 className="mentors-page__results-title">
              Available Mentors
              {!loading && (
                <span className="mentors-page__count">({mentors.length})</span>
              )}
            </h2>
          </div>

          {loading && (
            <div className="mentors-page__loading">
              <div className="mentors-page__spinner" />
              <p>Loading mentors...</p>
            </div>
          )}

          {error && (
            <div className="mentors-page__error">
              <p>{error}</p>
              <button onClick={fetchMentors}>Try Again</button>
            </div>
          )}

          {!loading && !error && mentors.length === 0 && (
            <div className="mentors-page__empty">
              <p>No mentors found matching your filters.</p>
              <button onClick={handleClearSkills}>Clear Filters</button>
            </div>
          )}

          {!loading && !error && mentors.length > 0 && (
            <div className="mentors-page__grid">
              {mentors.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onBookSession={handleBookSession}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {selectedMentor && (
        <BookingModal
          mentor={selectedMentor}
          onClose={handleCloseModal}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default MentorsPage;
