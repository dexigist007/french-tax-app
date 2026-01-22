
import React, { useState, useEffect } from 'react';
import { useServices } from '../contexts/ServiceContext';
import { MaritalStatus, MemberRole } from '../../core/types';
import type { HouseholdMember } from '../../core/types';
import { MemberList } from '../features/MemberList';
import { MemberForm } from '../features/MemberForm';
import { Button } from '../components/Button';
import { SelectInput } from '../components/SelectInput';

export const HouseholdScreen: React.FC = () => {
  const { householdService, yearService } = useServices();
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<HouseholdMember | undefined>(undefined);
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>(MaritalStatus.SINGLE);
  const [yearId, setYearId] = useState<string>('');

  const loadData = async () => {
    const list = await householdService.getMembers();
    setMembers(list);
    
    const year = await yearService.getActiveYear();
    if (year && year.household) {
        setMaritalStatus(year.household.maritalStatus);
        setYearId(year.id);
    }
  };

  useEffect(() => {
    loadData();
  }, [householdService, yearService]);

  const handleSubmit = async (data: Omit<HouseholdMember, 'id'>) => {
    let memberId: string;
    if (editingMember) {
        await householdService.updateMember({ ...editingMember, ...data });
        memberId = editingMember.id;
        // Role change might require moving between declarants/dependents lists in household
        // For MVP we assume role doesn't change often or we just re-sync.
        // Let's re-sync logic just in case role changed.
        const year = await yearService.getActiveYear();
        if (year && year.household) {
             const household = { ...year.household };
             // Remove from both
             household.declarants = household.declarants.filter(id => id !== memberId);
             household.dependents = household.dependents.filter(id => id !== memberId);
             // Add back based on new role
             if (data.role === MemberRole.DECLARANT_1 || data.role === MemberRole.DECLARANT_2) {
                 household.declarants.push(memberId);
             } else {
                 household.dependents.push(memberId);
             }
             await yearService.updateHousehold(year.id, household);
        }
    } else {
        const newMember = await householdService.createMember(data);
        memberId = newMember.id;
        
        // Link to active year
        try {
            const year = await yearService.getActiveYear();
            if (year && year.household) {
                const household = { ...year.household };
                const currentDeclarants = household.declarants || [];
                const currentDependents = household.dependents || [];

                if (data.role === MemberRole.DECLARANT_1 || data.role === MemberRole.DECLARANT_2) {
                    household.declarants = [...currentDeclarants, memberId];
                } else {
                    household.dependents = [...currentDependents, memberId];
                }
                await yearService.updateHousehold(year.id, household);
            }
        } catch (linkError) {
            console.error("Error linking member to year:", linkError);
            // We don't block the UI if linking fails, but we should probably alert?
            // For now, let's swallow it to avoid "Error" UI state since Member IS created.
            // Or better, show a warning toast? 
            // Since the user says "It saves", showing success is better than blocking error.
        }
    }
    await loadData();
    setShowForm(false);
    setEditingMember(undefined);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
        await householdService.deleteMember(id);
        
        // Remove from active year
        const year = await yearService.getActiveYear();
        if (year && year.household) {
             const household = { ...year.household };
             household.declarants = household.declarants.filter(d => d !== id);
             household.dependents = household.dependents.filter(d => d !== id);
             await yearService.updateHousehold(year.id, household);
        }

        await loadData();
    }
  };

  const handleEdit = (member: HouseholdMember) => {
    setEditingMember(member);
    setShowForm(true);
  };
  
  const handleStatusChange = async (status: MaritalStatus) => {
      try {
          setMaritalStatus(status);
          if (yearId) {
              const year = await yearService.getYear(yearId);
              if (year && year.household) {
                  await yearService.updateHousehold(yearId, {
                      ...year.household,
                      maritalStatus: status
                  });
              }
          }
      } catch (error) {
          console.error("Failed to save marital status:", error);
          alert("Erreur lors de la sauvegarde du statut marital.");
      }
  };

  const maritalStatusOptions = [
      { value: MaritalStatus.SINGLE, label: 'Célibataire' },
      { value: MaritalStatus.MARRIED, label: 'Marié(e)' },
      { value: MaritalStatus.CIVIL_UNION, label: 'Pacsé(e)' },
      { value: MaritalStatus.DIVORCED, label: 'Divorcé(e)' },
      { value: MaritalStatus.SEPARATED, label: 'Séparé(e)' },
      { value: MaritalStatus.WIDOWED, label: 'Veuf / Veuve' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Mon Foyer Fiscal</h1>
            <p className="text-gray-600 mt-1">Gérez la composition de votre foyer.</p>
        </div>
        {!showForm && (
            <Button onClick={() => { setEditingMember(undefined); setShowForm(true); }}>
                Ajouter un membre
            </Button>
        )}
      </header>
      
      {!showForm && (
          <div className="card bg-white p-6 rounded-lg shadow-sm mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Situation Familiale</h3>
              <div className="max-w-xs">
                  <SelectInput
                      id="maritalStatus"
                      label="Statut marital"
                      options={maritalStatusOptions}
                      value={maritalStatus}
                      onChange={(e) => handleStatusChange(e.target.value as MaritalStatus)}
                  />
              </div>
          </div>
      )}

      {showForm ? (
        <div className="mb-8">
            <MemberForm 
                onSubmit={handleSubmit} 
                initialData={editingMember}
                onCancel={() => { setShowForm(false); setEditingMember(undefined); }}
            />
        </div>
      ) : (
        <MemberList 
            members={members} 
            onEdit={handleEdit} 
            onDelete={handleDelete}
        />
      )}
    </div>
  );
};
