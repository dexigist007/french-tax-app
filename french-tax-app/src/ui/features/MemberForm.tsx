
import React, { useState } from 'react';
import { MemberRole, CustodyType } from '../../core/types';
import type { HouseholdMember } from '../../core/types';
import { TextInput } from '../components/TextInput';
import { SelectInput } from '../components/SelectInput';
import { Button } from '../components/Button';

interface MemberFormProps {
  onSubmit: (member: Omit<HouseholdMember, 'id'>) => Promise<void>;
  initialData?: HouseholdMember;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const MemberForm: React.FC<MemberFormProps> = ({ onSubmit, initialData, isLoading, onCancel }) => {
  const [formData, setFormData] = useState<Partial<HouseholdMember>>({
    firstName: '',
    lastName: '',
    role: MemberRole.CHILD,
    birthDate: '',
    disabilityCard: false,
    warVeteran: false,
    custody: CustodyType.NONE,
    attachedToHousehold: true,
    ...initialData,
  });

  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof HouseholdMember, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.firstName || !formData.lastName || !formData.role || !formData.birthDate) {
        setError("Tous les champs obligatoires doivent être remplis.");
        return;
    }

    try {
      await onSubmit(formData as Omit<HouseholdMember, 'id'>);
      if (!initialData) {
          // Reset form
          setFormData({
            firstName: '',
            lastName: '',
            role: MemberRole.CHILD,
            birthDate: '',
            disabilityCard: false,
            warVeteran: false,
            custody: CustodyType.NONE,
            attachedToHousehold: true,
          });
      }
    } catch (err: any) {
      console.error("Error submitting member form:", err);
      setError(err.message || "Une erreur est survenue.");
    }
  };

  const roleOptions = [
    { value: MemberRole.DECLARANT_1, label: 'Déclarant 1' },
    { value: MemberRole.DECLARANT_2, label: 'Déclarant 2' },
    { value: MemberRole.CHILD, label: 'Enfant' },
    { value: MemberRole.DEPENDENT, label: 'Autre personne à charge' },
  ];

  const custodyOptions = [
    { value: CustodyType.NONE, label: 'Non applicable / Garde principale' },
    { value: CustodyType.EXCLUSIVE, label: 'Garde exclusive' },
    { value: CustodyType.ALTERNATE, label: 'Garde alternée' },
  ];
  
  const isChild = formData.role === MemberRole.CHILD;
  const isAdult = formData.role === MemberRole.DECLARANT_1 || formData.role === MemberRole.DECLARANT_2 || formData.role === MemberRole.DEPENDENT;

  return (
    <form onSubmit={handleSubmit} className="card max-w-lg mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">
        {initialData ? 'Modifier le membre' : 'Ajouter un membre au foyer'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <TextInput
            id="firstName"
            label="Prénom"
            value={formData.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            required
        />
        <TextInput
            id="lastName"
            label="Nom"
            value={formData.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            required
        />
      </div>

      <SelectInput
        id="role"
        label="Rôle dans le foyer"
        options={roleOptions}
        value={formData.role || ''}
        onChange={(e) => handleChange('role', e.target.value as MemberRole)}
        required
      />

      <TextInput
        id="birthDate"
        label="Date de naissance"
        type="date"
        value={formData.birthDate || ''}
        onChange={(e) => handleChange('birthDate', e.target.value)}
        required
      />

      <div className="mt-4 space-y-2">
          <label className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={formData.disabilityCard || false} 
                onChange={(e) => handleChange('disabilityCard', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Carte d'invalidité (&ge; 80%)</span>
          </label>
          
          {isAdult && (
              <label className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    checked={formData.warVeteran || false} 
                    onChange={(e) => handleChange('warVeteran', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Carte du combattant</span>
              </label>
          )}
      </div>

      {isChild && (
          <div className="mt-4">
            <SelectInput
                id="custody"
                label="Type de garde"
                options={custodyOptions}
                value={formData.custody || CustodyType.NONE}
                onChange={(e) => handleChange('custody', e.target.value as CustodyType)}
            />
          </div>
      )}

      <div className="mt-6 flex space-x-3">
        {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                Annuler
            </Button>
        )}
        <Button type="submit" className="flex-1" isLoading={isLoading}>
          {initialData ? 'Mettre à jour' : 'Ajouter'}
        </Button>
      </div>
    </form>
  );
};
