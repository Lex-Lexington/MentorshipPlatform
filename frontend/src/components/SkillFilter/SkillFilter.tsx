import React from 'react';
import './SkillFilter.css';

interface SkillFilterProps {
  allSkills: string[];
  selectedSkills: string[];
  onToggleSkill: (skill: string) => void;
  onClearAll: () => void;
}

/**
 * SkillFilter — dynamic sidebar for filtering mentors by skills.
 */
const SkillFilter: React.FC<SkillFilterProps> = ({
  allSkills,
  selectedSkills,
  onToggleSkill,
  onClearAll,
}) => {
  return (
    <aside className="skill-filter">
      <div className="skill-filter__header">
        <h3 className="skill-filter__title">Filter by Skills</h3>
        {selectedSkills.length > 0 && (
          <button className="skill-filter__clear-btn" onClick={onClearAll}>
            Clear All
          </button>
        )}
      </div>

      <div className="skill-filter__list">
        {allSkills.map((skill) => {
          const isActive = selectedSkills.includes(skill);
          return (
            <button
              key={skill}
              className={`skill-filter__chip ${isActive ? 'skill-filter__chip--active' : ''}`}
              onClick={() => onToggleSkill(skill)}
              aria-pressed={isActive}
            >
              {skill}
            </button>
          );
        })}
      </div>

      {selectedSkills.length > 0 && (
        <p className="skill-filter__count">
          {selectedSkills.length} skill{selectedSkills.length > 1 ? 's' : ''} selected
        </p>
      )}
    </aside>
  );
};

export default SkillFilter;
