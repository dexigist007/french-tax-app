
import React, { useState, useEffect } from 'react';
import { useServices } from '../contexts/ServiceContext';
import type { DeclarationChecklist } from '../../core/types';

export const DeclarationScreen: React.FC = () => {
  const { yearService, declarationService } = useServices();
  const [checklist, setChecklist] = useState<DeclarationChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadChecklist();
  }, [yearService]);

  const loadChecklist = async () => {
    setIsLoading(true);
    const year = await yearService.getActiveYear();
    if (year) {
        const list = await declarationService.generateChecklist(year.year);
        setChecklist(list);
    }
    setIsLoading(false);
  };

  const toggleStep = (id: string) => {
    if (!checklist) return;
    const updatedItems = checklist.items.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklist({
        ...checklist,
        items: updatedItems,
        progress: declarationService.calculateProgress({ ...checklist, items: updatedItems })
    });
  };

  if (isLoading || !checklist) {
      return (
          <div className="text-center py-10">
              Chargement de la préparation...
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Préparation à la déclaration {checklist.year}</h1>
        <p className="text-gray-600 mt-2">
            Suivez ces étapes pour préparer votre déclaration de revenus officielle.
        </p>
        
        <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 text-sm">
            <p className="font-bold">Important :</p>
            <p>
                Vous effectuez vous-même votre déclaration sur impots.gouv.fr.
                L’application ne transmet aucune donnée à l’administration fiscale.
            </p>
        </div>
      </div>

      <div className="card bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Progression</h2>
              <span className="text-blue-600 font-bold">{checklist.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${checklist.progress}%` }}
              ></div>
          </div>
      </div>

      <div className="space-y-4">
          {checklist.items.map((item) => (
              <div 
                key={item.id} 
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                    item.completed 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
                onClick={() => toggleStep(item.id)}
              >
                  <div className="flex items-start">
                      <div className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                          item.completed ? 'border-green-500 bg-green-500 text-white' : 'border-gray-300'
                      }`}>
                          {item.completed && (
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                          )}
                      </div>
                      <div>
                          <h3 className={`font-medium ${item.completed ? 'text-green-900' : 'text-gray-900'}`}>
                              Étape {item.step} : {item.label}
                          </h3>
                      </div>
                  </div>
              </div>
          ))}
      </div>
      
      {checklist.progress === 100 && (
          <div className="mt-8 text-center p-6 bg-green-100 rounded-lg text-green-800 animate-fade-in">
              <h3 className="text-xl font-bold mb-2">Félicitations !</h3>
              <p>Vous avez terminé la préparation de votre déclaration.</p>
          </div>
      )}
    </div>
  );
};
