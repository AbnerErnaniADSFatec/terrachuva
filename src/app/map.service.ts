import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  url = "http://sjc.salvar.cemaden.gov.br/resources/dados/327_24.json";

  constructor(private httpClient: HttpClient) { }

  listar() {
    return this.httpClient.get(this.url);
  }

}
