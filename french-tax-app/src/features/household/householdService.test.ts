
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HouseholdService } from './householdService';
import { StorageService } from '../../core/storage';
import { MemberRole } from '../../core/types';
import 'fake-indexeddb/auto';

const DB_NAME = 'household-test-db';

describe('Household Service', () => {
  let storage: StorageService;
  let service: HouseholdService;
  const TEST_PASSWORD = 'secure-password-123';

  beforeEach(async () => {
    const uniqueDbName = `${DB_NAME}-${Math.random().toString(36).substring(7)}`;
    storage = new StorageService(uniqueDbName);
    await storage.initializeEncryption(TEST_PASSWORD);
    service = new HouseholdService(storage);
  });

  afterEach(async () => {
    await storage.close();
  });

  it('should create a new member', async () => {
    const member = await service.createMember({
        firstName: 'Jean',
        lastName: 'Dupont',
        role: MemberRole.DECLARANT_1,
        birthDate: '1980-01-01',
        disabilityCard: false,
        warVeteran: false,
        attachedToHousehold: true
    });
    expect(member.id).toBeDefined();
    expect(member.firstName).toBe('Jean');
    expect(member.role).toBe(MemberRole.DECLARANT_1);
    
    const stored = await service.getMember(member.id);
    expect(stored).toEqual(member);
  });

  it('should validate required fields', async () => {
    await expect(service.createMember({
        firstName: '',
        lastName: 'Dupont',
        role: MemberRole.CHILD,
        birthDate: '2010-01-01',
        disabilityCard: false,
        warVeteran: false,
        attachedToHousehold: true
    })).rejects.toThrow('Le prénom et le nom sont obligatoires.');
      
    await expect(service.createMember({
        firstName: 'Jean',
        lastName: '',
        role: MemberRole.CHILD,
        birthDate: '2010-01-01',
        disabilityCard: false,
        warVeteran: false,
        attachedToHousehold: true
    })).rejects.toThrow('Le prénom et le nom sont obligatoires.');
  });

  it('should validate birth date', async () => {
     // Service logic changed to check birthDate presence, not validity of string per se in createMember
     // but let's check basic requirement
    await expect(service.createMember({
        firstName: 'Jean',
        lastName: 'Dupont',
        role: MemberRole.CHILD,
        birthDate: '',
        disabilityCard: false,
        warVeteran: false,
        attachedToHousehold: true
    })).rejects.toThrow('La date de naissance est obligatoire.');
  });

  it('should update a member', async () => {
    const member = await service.createMember({
        firstName: 'Jean',
        lastName: 'Dupont',
        role: MemberRole.DECLARANT_1,
        birthDate: '1980-01-01',
        disabilityCard: false,
        warVeteran: false,
        attachedToHousehold: true
    });
    
    const updated = { ...member, firstName: 'Pierre' };
    await service.updateMember(updated);
    
    const stored = await service.getMember(member.id);
    expect(stored?.firstName).toBe('Pierre');
  });

  it('should delete a member', async () => {
    const member = await service.createMember({
        firstName: 'Jean',
        lastName: 'Dupont',
        role: MemberRole.DECLARANT_1,
        birthDate: '1980-01-01',
        disabilityCard: false,
        warVeteran: false,
        attachedToHousehold: true
    });
    await service.deleteMember(member.id);
    
    const stored = await service.getMember(member.id);
    expect(stored).toBeUndefined();
  });
});
