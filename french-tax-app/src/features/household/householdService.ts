
import { StorageService } from '../../core/storage';
import type { HouseholdMember } from '../../core/types';

export class HouseholdService {
  private storage: StorageService;

  constructor(storage: StorageService) {
    this.storage = storage;
  }

  async createMember(
      data: Omit<HouseholdMember, 'id'>
  ): Promise<HouseholdMember> {
    if (!data.firstName || !data.lastName) {
      throw new Error('Le prénom et le nom sont obligatoires.');
    }
    // Basic validation
    if (!data.birthDate) {
         throw new Error('La date de naissance est obligatoire.');
    }

    const member: HouseholdMember = {
      ...data,
      id: crypto.randomUUID(),
    };

    await this.storage.saveMember(member);
    return member;
  }

  async updateMember(member: HouseholdMember): Promise<void> {
    if (!member.id) {
        throw new Error('ID manquant pour la mise à jour.');
    }
    if (!member.firstName || !member.lastName) {
      throw new Error('Le prénom et le nom sont obligatoires.');
    }
    await this.storage.saveMember(member);
  }

  async getMembers(): Promise<HouseholdMember[]> {
    return this.storage.getAllMembers();
  }
  
  async getMember(id: string): Promise<HouseholdMember | undefined> {
      return this.storage.getMember(id);
  }

  async deleteMember(id: string): Promise<void> {
      await this.storage.deleteMember(id);
  }
}
