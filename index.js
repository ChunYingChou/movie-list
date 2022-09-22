
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const MOVIES_PER_PAGE = 12 // 畫面一頁只顯示12部電影
const pagibator = document.querySelector('#pagibator')
let filteredMovies = []


function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    // title.image.id 隨著每個 item 改變
    // 在button的class裡面接著加入data-id以取得每部電影的id
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img
              src="${POSTER_URL + item.image}"
              class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
              <button type="button" class="btn btn-info btn-add-favorite" data-id=${item.id}>+</button>
            </div>
          </div>
        </div>
      </div>
`
  })
  dataPanel.innerHTML = rawHTML
}

// 參數:第幾頁
function getMoviesByPage(page) {
  // (三元運算子)如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies
  const data = (filteredMovies.length) ? filteredMovies : movies
  // page 1 -> 0-11
  // page 2 -> 12-23
  // page 3 -> 24-35 ... 
  // 計算起始 index 
  const startIndex = (page - 1) * MOVIES_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

// 參數:電影數量
function renderPaginator(amount) {
  // 計算總頁數(有餘數則無條件進位)
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE)
  // 製作template
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    // 在每個<a>標籤中，加上 data-page 屬性來標注頁數，方便後續取用頁碼
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  pagibator.innerHTML = rawHTML

}

// 新增 Pagination 標籤的事件監聽器
pagibator.addEventListener('click', function onPaginatorClicked(event) {
  let target = event.target
  // 如果點擊的不是<a>(要打大寫)則return
  if (target.tagName !== 'A') return
  // 透過 dataset 取得被點擊的頁數
  const page = Number(target.dataset.page)
  // console.log(page)
  //更新畫面
  renderMovieList(getMoviesByPage(page))
})

function addToFavorite(id) {
  // console.log(id)

  // list為收藏清單, || 表示會判斷左右兩邊哪個是true和false,接著回傳是true的那邊
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  // .find的用法 :在找到第一個符合條件的 item 後就會停下來回傳該 item
  const movie = movies.find((movie) => movie.id === id) // 請 find 去電影總表中查看，找出 id 相同的電影物件回傳

  // .some的用法 :some 只會回報「陣列裡有沒有 item 通過檢查條件」，有的話回傳 true ，到最後都沒有就回傳 false
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中!')
  }

  list.push(movie) // 把 movie 推進收藏清單
  alert('電影已加到收藏清單')

  localStorage.setItem('favoriteMovies', JSON.stringify(list)) // 接著呼叫 localStorage.setItem，把更新後的收藏清單同步到 local stroage
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  let target = event.target
  if (target.matches('.btn-show-movie')) {
    //console.log(target.dataset)
    //console.log(typeof (target.dataset.id))
    // 回傳回來的id資料型態為"字串"
    showMovieModal(target.dataset.id)
  } else if (target.matches('.btn-add-favorite')) {
    addToFavorite(Number(target.dataset.id))

  }
})

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  // 回傳回來的id為字串,axios裡面字串+字串連接還是會強制轉型為字串,故上面不需要特別轉型為Number
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date:' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `
    <img src="${POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">
    `
  })
}




searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()  // 取消事件的預設行為
  //console.log('click!')
  filteredMovies = [] // 只要按下搜尋鍵就歸零重整
  // .trim()->去除空格, .toLowerCase()->轉換為小寫
  const keyword = searchInput.value.trim().toLowerCase()

  // 如果沒有輸入東西的結果
  /* if (!keyword.length) {
    return alert('請輸入有效關鍵字!')
  } */

  // 方法一:用for-of迴圈找出相同關鍵字的電影放入新陣列
  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie)
    }
  }

  /* // 方法二:用fliter操作陣列
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  ) */

  // 沒有符合搜尋條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字:${keyword},沒有符合條件的電影`)
  }
  // 重製分頁器
  renderPaginator(filteredMovies.length)
  // 重新呼叫 renderMovieList 會導致瀏覽器重新渲染
  renderMovieList(getMoviesByPage(1))

})

// 邊輸入文字邊看到篩選結果
searchForm.addEventListener('input', function onSearchFormInput(event) {
  event.preventDefault()  // 取消事件的預設行為
  filteredMovies = []
  const keyword = searchInput.value.trim().toLowerCase()

  // 方法一:用for-of迴圈找出相同關鍵字的電影放入新陣列
  for (const movie of movies) {
    if (movie.title.toLowerCase().includes(keyword)) {
      filteredMovies.push(movie)
    }
  }
  // 重製分頁器
  renderPaginator(filteredMovies.length)
  // 重新呼叫 renderMovieList 會導致瀏覽器重新渲染
  renderMovieList((getMoviesByPage(1))
  )

})


axios.get(INDEX_URL).then(function (response) {
  //console.log(response)
  //console.log(response.data)
  // Array(80)
  //console.log(response.data.results)
  // 加上"..."直接取出Array(80)裡面的資料
  //console.log(...response.data.results)
  // 或是使用for-of迴圈
  //for (const movie of response.data.results) {
  //movies.push(movie)
  //}
  //console.log(movies)

  movies.push(...response.data.results)
  // console.log(movies)
  // renderMovieList(movies)
  renderMovieList(getMoviesByPage(1)) // 作完一頁顯示12個數量的函式之後呼叫它
  renderPaginator(movies.length) // (分頁器)依據電影數量渲染出幾頁


}).catch(function (err) {
  console.log(err)
})
