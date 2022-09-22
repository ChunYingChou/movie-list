
const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')


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
              <button type="button" class="btn btn-danger btn-remove-favorite" data-id=${item.id}>X</button>
            </div>
          </div>
        </div>
      </div>
`
  })
  dataPanel.innerHTML = rawHTML
}

function removeFromFavorite(id) {

  // 這裡加上兩個條件控制：一旦收藏清單是空的，或傳入的 id 在收藏清單中不存在，就結束這個函式
  if (!movies || !movies.length) return

  // //透過 id 找到要刪除電影的 index
  const movieIndex = movies.findIndex((movie) => movie.id === id)

  // 若沒能找到符合的項目，則會回傳 -1
  if (movieIndex === -1) return

  // 用splice刪除該筆電影
  movies.splice(movieIndex, 1)

  // 存回 local storage
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  // 更新頁面
  renderMovieList(movies)
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  let target = event.target
  if (target.matches('.btn-show-movie')) {
    //console.log(target.dataset)
    //console.log(typeof (target.dataset.id))
    // 回傳回來的id資料型態為"字串"
    showMovieModal(target.dataset.id)
  } else if (target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(target.dataset.id))
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


// 重新呼叫 renderMovieList 會導致瀏覽器重新渲染
renderMovieList(movies)

