import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast, ToastContainer } from 'react-toastify';

const PaymentDetail=()=>{
    //params
    const {paymentNo} = useParams();
    //state
    const [info, setInfo] = useState(null);
    const [selectedDetailName, setSelectedDetailName] = useState([]);
    //effect
    useEffect(()=>{
        loadPaymentInfo();
    },[]);

    //callback
    const loadPaymentInfo= useCallback(async()=>{
        const resp= await axios.get("/seats/detail/"+paymentNo);
        setInfo(resp.data);
    }, []);
    
    const cancelPaymentAll = useCallback(async()=>{
        const resp= await axios.delete("/seats/cancelAll/"+paymentNo);
        loadPaymentInfo();//화면 갱신
    }, []);

    // const cancelPaymentItem = useCallback(async(detail)=>{
    //     const resp= await axios.delete("/seats/cancelItem/"+detail.paymentDetailNo)
    //     loadPaymentInfo();//화면 갱신
    // }, [info]);

    const cancelPaymentItem = useCallback(async (detail) => {
        setSelectedDetailName(prev => {
            return [...prev, detail.paymentDetailName];
        });
        await axios.delete(`/seats/cancelItem/${detail.paymentDetailNo}`);
        toast.success(`${detail.paymentDetailName} 항목이 취소되었습니다.`);
        loadPaymentInfo();
    }, [loadPaymentInfo]);
    //한글 변환
    const changeKorean = (type) => {
        switch (type) {
            case 'CARD':
                return '카드';
            case 'MONEY':
                return '현금';
            case 'PAYMENT':
                return '결제';
            case 'CANCEL':
                return '취소';
            case 'SUCCESS_PAYMENT':
                return '결제완료';
            case 'CANCEL_PAYMENT':
                return "취소완료";
            case 'PART_CANCEL_PAYMENT':
                return '부분취소 완료';
            default:
                return type;
        }
    };
    //날짜 변환
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {hour12: true };
        return date.toLocaleString(options); 
    };

    //view
    return(<>
            {info ? (  // info가 존재할 경우에만 렌더링
            <div className="container">
            <div className="row mb-4 mt-2">
                <div className="col">
                    <h2>결제 내역</h2>
                    <div className="row mt-2">
                        <div className="col-3"><h5>결제명</h5></div>
                        <div className="col-9"><h5>{info.paymentDto.paymentName}</h5></div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3"><h5>총 결제금액</h5></div>
                        <div className="col-9"><h5>{info.paymentDto.paymentTotal.toLocaleString()}원</h5></div>
                    </div>
                        <div className="row mt-2">
                            <div className="col">
                                <button className="btn btn-danger"
                                disabled={info.paymentDto.paymentRemain ===0}
                                onClick={cancelPaymentAll}>전체취소</button>
                            </div>
                        </div>
                </div>
            <ul className="list-group mt-2">
                {info.paymentDetailList.map(detail=>(
                    <li className="list-group-item">
                        <h5>좌석번호: {detail.paymentDetailName}</h5>
                        <div className="row mt-2">
                            <div className="col-3">판매가</div>
                            <div className="col-9">{detail.paymentDetailPrice.toLocaleString()}원</div>
                        </div>
                        <div className="row mt-2">
                            <div className="col-3">상태</div>
                            <div className="col-9">{detail.paymentDetailStatus}</div>
                        </div>
                        <div className="row mt-2">
                            <div className="col">
                                <button className="btn btn-danger"
                                disabled={detail.paymentDetailStatus=== '취소'} 
                                onClick={e=>cancelPaymentItem(detail)}>
                                    항목취소
                                </button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            </div>
        </div>
              ) : (
                <div>Loading...</div>  // 데이터 로딩 중 표시할 메시지
            )}
            
        {info ? (  // info가 존재할 경우에만 렌더링
        <div className="container">
            <div className="row mt-5">
                <div className="col">
                        <h3>결제 정보</h3>
                    <div className="row mt-2">
                        <div className="col-3">거래번호</div>
                        <div className="col-9">{info.responseVO.tid}</div>
                    </div>
                    {/* <div className="row mt-2">
                        <div className="col-3">가맹점 내부 거래번호</div>
                        <div className="col-9">{info.responseVO.partner_order_id}</div>
                    </div> */}
                    <div className="row mt-2">
                        <div className="col-3">거래상태</div>
                        <div className="col-9">{changeKorean(info.responseVO.status)}</div>
                    </div>
                    {/* <div className="row mt-2">
                        <div className="col-3">회원아이디</div>
                        <div className="col-9">{info.responseVO.partner_user_id}</div>
                        </div> */}
                        <div className="row mt-2">
                            <div className="col-3">결제완료일시</div>
                            <div className="col-9">{formatDate(info.responseVO.approved_at)}</div>
                            </div>
                        {info.responseVO.item_code !==null && (
                    <div className="row mt-2">
                        <div className="col-3">상품코드</div>
                        <div className="col-9">{info.responseVO.item_code}</div>
                    </div>
                        )}
                    <div className="row mt-2">
                        <div className="col-3">대표좌석</div>
                        <div className="col-9">{info.responseVO.item_name}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">구매방식</div>
                        <div className="col-9">{changeKorean(info.responseVO.payment_method_type)}</div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-3">구매금액</div>
                        <div className="col-9">{info.responseVO.amount.total.toLocaleString()}원
                            (부가세 포함, 부가세 {info.responseVO.amount.vat.toLocaleString()}원)
                    </div>
                    <div className="row mt-2">
                        <div className="col-3 text-danger">취소가능금액</div>
                        <div className="col-9 text-danger">{info.responseVO.cancel_available_amount.total.toLocaleString()}원
                        </div>
                    </div>

                        {/* {info.responseVO.canceled_amount.total >0 && (
                    <div className="row mt-2">
                        <div className="col-3">취소완료금액</div>
                        <div className="col-9">{info.responseVO.canceled_amount.total.toLocaleString()}원
                        </div>
                    </div>
                        )} */}
                    {info.responseVO.canceled_at !==null &&(
                    <div className="row mt-2">
                        <div className="col-3">결제취소일시</div>
                        <div className="col-9">{formatDate(info.responseVO.canceled_at)}</div>
                    </div>
                    )}
                    {/* 결제 상세 내역 */}
                    <ul className="list-group mt-4">
                        <div className="row">
                            <div className="col">
                                <h3>요청 내역</h3>
                            </div>
                        </div>
                    {info.responseVO.payment_action_details.map((action, index)=>(
                        <li className="list-group-item" key={index}>
                            <div className="row">
                                <div className="col-3">요청번호</div>
                                <div className="col-9">{action.aid}</div>
                            </div>
                            <div className="row">
                                <div className="col-3">요청유형</div>
                                <div className="col-9">{changeKorean(action.payment_action_type)}</div>
                            </div>
                            {action.amount !== 0 &&(
                            <div className="row">
                                 <div className="col-3">요청금액</div>
                                <div className="col-9">{action.amount.toLocaleString()}원</div>
                            </div>
                            )}
                            <div className="row">
                                <div className="col-3">요청승인일시</div>
                                <div className="col-9">{formatDate(action.approved_at)}</div>
                            </div>
                            {action.payload !==null && (
                            <div className="row">
                                <div className="col-3">추가요청사항</div>
                                <div className="col-9">{action.payload}</div>
                            </div>
                            )}
                        </li>
                    ))}
                    </ul>
                    </div>
                </div>
            </div>
            <ToastContainer/>
        </div>
        ) : (
            <div>Loading...</div>  // 데이터 로딩 중 표시할 메시지
        )}
    </>);
};
export default PaymentDetail;