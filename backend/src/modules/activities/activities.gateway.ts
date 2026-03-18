import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface ActivityPayload {
  id: string;
  projectId: string;
  userId: string | null;
  message: string;
  createdAt: Date | null;
}

export interface CommentPayload {
  id: string;
  activityId: string;
  userId: string;
  userName: string | null;
  message: string;
  createdAt: Date | null;
}

export interface TaskPayload {
  id: string;
  projectId: string;
  title: string;
  status: string;
  category: string | null;
  createdAt: Date | null;
}

export interface ProjectPayload {
  id: string;
  name: string;
  status: string;
  clientId: string | null;
  proId: string | null;
  startDate: Date | null;
  estimatedEndDate: Date | null;
  createdAt: Date | null;
}

type DeletedPayload = { id: string; deleted: true };

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? 'http://localhost:8080', credentials: true },
  namespace: '/ws',
})
export class ActivitiesGateway {
  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('joinProject')
  handleJoinProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    client.join(`project:${projectId}`);
    return { event: 'joinedProject', data: projectId };
  }

  @SubscribeMessage('leaveProject')
  handleLeaveProject(
    @ConnectedSocket() client: Socket,
    @MessageBody() projectId: string,
  ) {
    client.leave(`project:${projectId}`);
  }

  @SubscribeMessage('joinClient')
  handleJoinClient(
    @ConnectedSocket() client: Socket,
    @MessageBody() clientId: string,
  ) {
    client.join(`client:${clientId}`);
    return { event: 'joinedClient', data: clientId };
  }

  @SubscribeMessage('leaveClient')
  handleLeaveClient(
    @ConnectedSocket() client: Socket,
    @MessageBody() clientId: string,
  ) {
    client.leave(`client:${clientId}`);
  }

  emitNewActivity(projectId: string, activity: ActivityPayload) {
    this.server.to(`project:${projectId}`).emit('newActivity', activity);
  }

  emitNewComment(projectId: string, comment: CommentPayload) {
    this.server.to(`project:${projectId}`).emit('newComment', comment);
  }

  emitTaskUpdate(projectId: string, task: TaskPayload | DeletedPayload) {
    this.server.to(`project:${projectId}`).emit('taskUpdate', task);
  }

  emitProjectUpdate(clientId: string | null, project: ProjectPayload | DeletedPayload) {
    if (clientId) {
      this.server.to(`client:${clientId}`).emit('projectUpdate', project);
    }
  }
}
