// $(function () {
    // $('.datepicker-input').daterangepicker({
    //     "locale": {
    //         "format": "YYYY-MM-DD",
    //         "separator": " ~ ",
    //         "applyLabel": "확인",
    //         "cancelLabel": "취소",
    //         "fromLabel": "From",
    //         "toLabel": "To",
    //         "customRangeLabel": "Custom",
    //         "weekLabel": "W",
    //         "daysOfWeek": ["월", "화", "수", "목", "금", "토", "일"],
    //         "monthNames": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
    //         "firstDay": 1
    //     },
    //     "drops": "down"
        
    // }, function (start, end, label) {
    //     let date = {
    //         startDate: start.format('YYYY-MM-DD'),
    //         endDate: end.format('YYYY-MM-DD'),
    //     }

    //     let dateInput = document.querySelector('#date')
    //     dateInput.dataset.start = date.startDate
    //     dateInput.dataset.end = date.endDate
    // });
// });


function fnSearch() {
    // let dateInput = document.querySelector('#date')
    let srtDt = document.querySelector('#srtDt').value
    let endDt = document.querySelector('#endDt').value
    let pageIndex = 1;

    var form = document.createElement("form");
    form.setAttribute("charset", "UTF-8");
    form.setAttribute("method", "Post"); //Post 방식
    form.setAttribute("action", "/p/view"); //요청 보낼 주소
    var hiddenField1 = document.createElement("input");
    hiddenField1.setAttribute("type", "hidden");
    hiddenField1.setAttribute("name", "pageIndex");
    hiddenField1.setAttribute("value", pageIndex);
    form.appendChild(hiddenField1);
    var hiddenField2 = document.createElement("input");
    hiddenField2.setAttribute("type", "hidden");
    hiddenField2.setAttribute("name", "srtDt");
    hiddenField2.setAttribute("value", srtDt);
    form.appendChild(hiddenField2);
    var hiddenField3 = document.createElement("input");
    hiddenField3.setAttribute("type", "hidden");
    hiddenField3.setAttribute("name", "endDt");
    hiddenField3.setAttribute("value", endDt);
    form.appendChild(hiddenField3);

    document.body.appendChild(form);
    form.submit();
}


function fnAdd() {
    $("#pageIndex").val(Number($("#pageIndex").val()) + 1);
    // var data = { "pageIndex": $("#pageIndex").val() };

    let srtDt = document.querySelector('#srtDt').value
    let endDt = document.querySelector('#endDt').value

    var data = {};
    data.pageIndex = $("#pageIndex").val();
    data.srtDt = srtDt;
    data.endDt = endDt;

    console.log('srtDt : ', srtDt)
    console.log('endDt : ', endDt)

    $.ajax({
        url: '/p/addView',
        dataType: 'json',
        type: 'POST',
        data: data,
        success: function (result) {

            let withdrawList = result.data.withdrawList;
            var pcHtml = '';
            var mobileHtml = '';

            

            for(var i = 0; i < withdrawList.length; i++) {
                            //     break; } %>
                            //   </td>
                            //   <td class="px-1 py-1.5 xl:px-2 xl:py-2 text-gray-500 whitespace-nowrap"><%=parseInt(el.pay_num).toLocaleString('ko-KR')%><span class="font-bold text-black"> Coin</span></td>
                            //   <td class="px-1 py-1.5 xl:px-2 xl:py-2 text-gray-500 whitespace-nowrap">
                            //     <span class=""><%=parseInt(buy_num).toLocaleString('ko-KR')%></span> <span>KRW</span>
                            //   </td>
                            // </tr>
                pcHtml += '<tr class="">';
                pcHtml += '<td class="">'+withdrawList[i].create_dt+'</td>';
                pcHtml += '<td class="">'+withdrawList[i].title+'</td>';
                pcHtml += '<td class="">';
                pcHtml += '<div class="">'
                        switch(withdrawList[i].confirm_sts_name) {
                        case '취소': 
                                pcHtml += '<div class="w-16 px-0 badge badge-primary">'+withdrawList[i].confirm_sts_name+'</div>';
                                break;
                        case '대기':
                                pcHtml += '<div class="w-16 px-0 badge badge-increase">'+withdrawList[i].confirm_sts_name+'</div>'
                                break;
                        case '완료':
                                pcHtml += '<div class="w-16 px-0 badge badge-approve">승인</div>'
                                break;
                                default:
                                break;
                            }
                pcHtml += '</div>'
                pcHtml += '</td>'
                pcHtml += '<td class="">'+parseInt(withdrawList[i].pay_num).toLocaleString('ko-KR')+' Coin</td>'
                pcHtml += '<td class="">'
                if (withdrawList[i].buy_num === '') {
                pcHtml += '<span class="">'+0+'</span> <span>KRW</span>'
                } else {
                pcHtml += '<span class="">'+parseInt(withdrawList[i].buy_num).toLocaleString('ko-KR')+'</span> <span>KRW</span>'
                }
                pcHtml += '</td>'
                pcHtml += '</tr>'


                // PC버전 엘리먼트 생성
                // pcHtml += '<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">';
                // pcHtml += '<td class="py-4 px-6 text-sm font-medium text-gray-900 whitespace-nowrap dark:text-white">' + withdrawList[i].create_dt + '</td>'
                // pcHtml += '<td class="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400 font-bold">' + withdrawList[i].title + '(KRW)</td>'
                // pcHtml += '<td class="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">'
                // switch(withdrawList[i].confirm_sts_name) {
                //     case '취소':
                //         pcHtml += '<span class="rounded-full px-3 bg-red-500 py-1 text-white state">' + withdrawList[i].confirm_sts_name + '</span></td>'
                //         break;
                //     case '대기':
                //         pcHtml += '<span class="rounded-full px-3 bg-blue-500 py-1 text-white state">' + withdrawList[i].confirm_sts_name + '</span></td>'
                //         break;
                //     case '완료':
                //         pcHtml += '<span class="rounded-full px-3 bg-green-500 py-1 text-white state">' + withdrawList[i].confirm_sts_name + '</span></td>'
                //         break;
                // }
                // pcHtml += '<td class="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">' + withdrawList[i].pay_num +  '</td>'
                // if (withdrawList[i].buy_num === '') {
                //     pcHtml += '<td class="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400"><span class="font-bold"> &#x20a9; ' +'0'+  ' </span> <span>KRW</span></td></tr>'
                // } else {
                //     pcHtml += '<td class="py-4 px-6 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400"><span class="font-bold"> &#x20a9; ' + parseInt(withdrawList[i].buy_num).toLocaleString('ko-KR') +  ' </span> <span>KRW</span></td></tr>'
                // }

                // //============= MOBILE버전 엘리먼트 생성
                // mobileHtml += '<div class="flex items-center py-4 px-5 justify-between rounded-lg border text-xs shadow-md md:w-full bg-white">'
                // mobileHtml += '<div class="text-left w-full">'
                // mobileHtml += '<div class="py-1 font-bold">' + withdrawList[i].create_dt + '</div>'
                // mobileHtml += '<div class="py-1">' + withdrawList[i].title + '(KRW) '
                //     switch(withdrawList[i].confirm_sts_name){
                //         case '취소':
                //         mobileHtml += '<span class="rounded-full px-3 bg-red-500 py-1 text-white state">' + withdrawList[i].confirm_sts_name + '</span></td>'
                //         break;
                //     case '대기':
                //         mobileHtml += '<span class="rounded-full px-3 bg-blue-500 py-1 text-white state">' + withdrawList[i].confirm_sts_name + '</span></td>'
                //         break;
                //     case '완료':
                //         mobileHtml += '<span class="rounded-full px-3 bg-green-500 py-1 text-white state">' + withdrawList[i].confirm_sts_name + '</span></td>'
                //         break;

                // }
                // mobileHtml += '</div>'
                // mobileHtml += '</div>'
                // mobileHtml += '<div class="text-right w-full">'
                // mobileHtml += '<div class="py-1">' + withdrawList[i].pay_num +  ' <span class="text-black font-bold">Coin</span></div>'
                // mobileHtml += '<div class="py-1"> &#x20a9 ' + parseInt(withdrawList[i].buy_num).toLocaleString('ko-KR') +  ' <span class="text-black font-bold">KRW</span></div>'
                // mobileHtml += '</div>'
                // mobileHtml += '</div>'
                // mobileHtml += '</div>'
                
            }

            $("#withdraw_body").append(pcHtml);
            $("#withdraw_mobile").append(mobileHtml)

        },
        error: function (XMLHttpRequest, textStatus, errorThrown) {
            // $('.popupWrap').hide();
            // $('.pMessage').html('세션이 종료 되었습니다. 로그인 후 다시 이용해 주세요.')
            // $('#alertPopup').show();
            alert('error')
        } //function끝
    });
}