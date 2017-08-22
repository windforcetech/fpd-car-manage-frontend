import {Icons} from './icon.model';

export interface Options {
  timeOut?: number;
  showProgressBar?: boolean;
  pauseOnHover?: boolean;
  lastOnBottom?: boolean;
  clickToClose?: boolean;
  maxLength?: number;
  maxStack?: number;
  preventDuplicates?: number;
  preventLastDuplicates?: boolean | string;
  theClass?: string;
  rtl?: boolean;
  animate?: 'fromRight' | 'fromLeft' | 'rotate' | 'scale';
  icons?: Icons;
  position?: ['top' | 'bottom', 'right' | 'left'];
}
