import { Socket } from 'socket.io-client';

export interface NextApiResponseServerIO extends NextApiResponse {
  socket: Socket & {
    server: any;
  };
}
