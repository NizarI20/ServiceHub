import React from 'react';
import { Skill } from '@/types';

interface SkillCardProps {
  skills: Skill[];
}

const SkillCard: React.FC<SkillCardProps> = ({ skills }) => {
  return (
    <section className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-bold mb-4">Compétences</h2>
      <div className="space-y-3">
        {skills.map((skill, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">{skill.name}</span>
              <span className="text-gray-500">{skill.level}/5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(skill.level / 5) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SkillCard;