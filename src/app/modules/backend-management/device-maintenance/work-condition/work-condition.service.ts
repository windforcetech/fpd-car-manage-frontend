import { Injectable } from '@angular/core';
import { AuthService } from '../../../../services/auth.service';
import { environment } from '../../../../../environments/environment';


@Injectable()
export class WorkConditionService {

  constructor(private authHttp: AuthService) { }

}
