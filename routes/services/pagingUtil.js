function fnPagination(pageIndex,totalPageCount,) {
  return new Promise(function (resolve, reject) {
    let pagination = {};
      pagination.rowsPerPage = 10;//페이지당 게시물 수
      pagination.pageListSize = 5;//페이지 숫자 버튼 개수
      pagination.pageIndex = parseInt(pageIndex)//현재페이지 
      pagination.totalPage = Math.ceil(parseInt(totalPageCount) / parseInt(pagination.rowsPerPage));  //전체 페이지 수 
      pagination.totalSet = Math.ceil(pagination.totalPage /  parseInt(pagination.pageListSize));    //전체 세트수
      pagination.curSet = Math.ceil(parseInt(pageIndex) /  parseInt(pagination.pageListSize)); // 현재 셋트 번호
      pagination.startPage = ((parseInt(pagination.curSet) - 1) *  parseInt(pagination.pageListSize)) + 1 //현재 세트내 출력될 시작 페이지;
      pagination.endPage = (parseInt(pagination.startPage) +  parseInt(pagination.pageListSize)) - 1; //현재 세트내 출력될 마지막 페이지;
      pagination.totalPageCount = totalPageCount;
      resolve(pagination)
  });
}

module.exports.getPagination = fnPagination;