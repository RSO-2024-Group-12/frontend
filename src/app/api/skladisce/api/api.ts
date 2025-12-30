export * from './greetingEndpoint.service';
import { GreetingEndpointService } from './greetingEndpoint.service';
export * from './skladisceREST.service';
import { SkladisceRESTService } from './skladisceREST.service';
export const APIS = [GreetingEndpointService, SkladisceRESTService];
