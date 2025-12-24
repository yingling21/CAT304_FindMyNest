export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  propertyId: string;
  propertyAddress: string;
  propertyImage: string;
  propertyPrice: number;
  
  tenantId: string;
  tenantName: string;
  tenantPhoto?: string;
  
  landlordId: string;
  landlordName: string;
  landlordPhoto?: string;
  
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  
  createdAt: string;
  updatedAt: string;
}
