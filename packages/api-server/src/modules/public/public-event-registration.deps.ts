export interface IPublicEventRegistrationAdminDeps {
  syncEventRegistrationCount(eventId: string | number): Promise<number>;
  getById(id: string): Promise<{
    id: number;
    eventId: number;
    email: string;
    fullName: string;
    status: number;
    registeredAt: string | null;
  } | null>;
  create(data: {
    eventId: number;
    email: string;
    fullName: string;
    phone: string | null;
    registeredAt: Date;
    status: number;
  }): Promise<{
    id: number;
    eventId: number;
    email: string;
    fullName: string;
    status: number;
    registeredAt: string | null;
  } | null>;
}
