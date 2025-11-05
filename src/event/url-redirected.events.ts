import { RequestWithUser } from 'src/types/RequestWithUser';

export class UrlRedirectedEvent {
  constructor(
    public readonly urlId: string,
    public readonly req: RequestWithUser,
  ) {}
}
