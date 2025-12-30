export * from './greetingEndpoint.service';
import { GreetingEndpointService } from './greetingEndpoint.service';
export * from './izdelekREST.service';
import { IzdelekRESTService } from './izdelekREST.service';
export const APIS = [GreetingEndpointService, IzdelekRESTService];
