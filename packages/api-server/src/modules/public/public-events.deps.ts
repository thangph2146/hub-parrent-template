export type PublicViewerRegistration = {
  id: number;
  email: string;
  fullName: string;
  status: number;
  registeredAt: string | null;
};

export type PublicEventSpeaker = {
  id: number;
  name: string;
  title: string | null;
  organization: string | null;
  avatar: string | null;
  role: string | null;
  presentationTitle: string | null;
  duration: number | null;
  startTime: string | null;
  endTime: string | null;
  sortOrder: number;
};

export type PublicEventRegistrantListItem = {
  fullName: string;
  registeredAt: string | null;
};

export interface IPublicEventsRegistrationsDeps {
  findActiveByEventAndEmail(
    eventId: string | number,
    email: string,
  ): Promise<PublicViewerRegistration | null>;
  syncEventRegistrationCount(eventId: string | number): Promise<number>;
  listPublicForEvent(
    eventId: string | number,
    limit: number,
  ): Promise<PublicEventRegistrantListItem[]>;
}

export interface IPublicEventsSpeakersDeps {
  list(params: {
    eventId: string | number;
    page: number;
    limit: number;
  }): Promise<{
    data: Array<{
      id: number;
      speakerName: string;
      speakerTitle: string | null;
      speakerOrganization: string | null;
      speakerAvatar: string | null;
      role: string | null;
      presentationTitle: string | null;
      duration: number | null;
      startTime: string | null;
      endTime: string | null;
      sortOrder: number;
    }>;
  }>;
}
