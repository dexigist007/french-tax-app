
import React from 'react';
import { MemberRole } from '../../core/types';
import type { HouseholdMember } from '../../core/types';

interface MemberListProps {
  members: HouseholdMember[];
  onEdit: (member: HouseholdMember) => void;
  onDelete: (id: string) => void;
}

export const MemberList: React.FC<MemberListProps> = ({ members, onEdit, onDelete }) => {
  if (members.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
        Aucun membre dans le foyer. Ajoutez les déclarants et les enfants.
      </div>
    );
  }

  const roleLabel = {
      [MemberRole.DECLARANT_1]: 'Déclarant 1',
      [MemberRole.DECLARANT_2]: 'Déclarant 2',
      [MemberRole.CHILD]: 'Enfant',
      [MemberRole.DEPENDENT]: 'Personne à charge',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map(member => (
            <div key={member.id} className="card flex flex-col justify-between">
                <div>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            {roleLabel[member.role]}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                        Né(e) le {member.birthDate.split('-').reverse().join('/')}
                    </p>
                </div>
                
                <div className="mt-4 flex justify-end space-x-2 border-t pt-4">
                    <button 
                        onClick={() => onEdit(member)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                        Modifier
                    </button>
                    <button 
                        onClick={() => onDelete(member.id)}
                        className="text-sm font-medium text-red-600 hover:text-red-500"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        ))}
    </div>
  );
};
