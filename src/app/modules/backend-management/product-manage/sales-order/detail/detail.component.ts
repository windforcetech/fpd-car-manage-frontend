import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SalesOrderService } from '../sales-order.service';
import { EventsService } from '../../../../../services/events-service.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.scss']
})
export class DetailComponent implements OnInit {

  public salesOrder: any; // 渲染结果集
  public id: string;
  public _deviceDetail_: any;
  constructor(
    private salesOrderService: SalesOrderService,
    private eventsService: EventsService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.checkAction();
  }

  // 根据id查看详情
  checkAction() {
    this.activatedRoute.params.subscribe((params: { id: string }) => {
      if (params.id) {
        this.id = params.id;
        this.DeviceDetail({ 'SalesOrderID': parseInt(params.id, 10) });
      }
    });
  }

  // 采购订单详情
  DeviceDetail(data) {
    this._deviceDetail_ = this.salesOrderService.SalesOrderDetail(data).subscribe((res) => {
      if (res.State) {
        this.salesOrder = res.Data;
      }
    }, (err) => {
      
        if(err.State == 10 || err.State == 11 || err.State == 12){
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, err.Message);
          setTimeout(()=>{
            this.router.navigate(['/account/login']);
          },2500)
        }else{
          this.eventsService.emitMessageEvent(err.State == 1 ? this.eventsService.eventNames.EVENT_TOAST_SUCCESS : this.eventsService.eventNames.EVENT_TOAST_ERROR, '网络异常!');
        }
    });
  }

  // 返回
  back() {
    this.router.navigate(['../../'], { relativeTo: this.activatedRoute });
  }

  ngOnDestroy() {
    if (this._deviceDetail_) {
      this._deviceDetail_.unsubscribe();
    }
  }

}
