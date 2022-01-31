import './css/style.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import imgCard from './templates/render-card.hbs';
import ApiService from './js/api-service';
import LoadMoreBtn from './js/load-more-btn';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  searchForm: document.querySelector('#search-form'),
  galleryContainer: document.querySelector('.gallery'),
};

const apiService = new ApiService();
const loadMoreBtn = new LoadMoreBtn();

loadMoreBtn.hide();

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.refs.button.addEventListener('click', findImg);

let hitsLength;

function onSearch(e) {
  e.preventDefault();

  apiService.query = e.currentTarget.elements.searchQuery.value;

  if (apiService.query === '') {
    return errorOfFind();
  }

  loadMoreBtn.hide();
  apiService.resetPage();
  clearGalleryContainer();
  findImg();

  hitsLength = 0;
}

async function findImg() {
  const { hits, totalHits } = await apiService.fetchImages();

  if (hits.length === 0) {
    loadMoreBtn.hide();
    return errorOfFind();
  }

  hitsLength += hits.length;
  console.log(hitsLength);

  if (hitsLength > totalHits) {
    loadMoreBtn.hide();
    return Notify.info("We're sorry, but you've reached the end of search results");
  }

  renderImageCard(hits);

  loadMoreBtn.show();

  if (apiService.page === 2) {
    Notify.success(`Hooray! We found ${totalHits} images.`);
  }
}

function renderImageCard(img) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', imgCard(img));

  lightboxGallery.refresh();

  if (apiService.page > 2) {
    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 1.6,
      behavior: 'smooth',
    });
  }
}

function clearGalleryContainer() {
  refs.galleryContainer.innerHTML = '';
}

function errorOfFind() {
  Notify.failure('Sorry, there are no images matching your search query. Please try again');
}

const lightboxOptions = {
  captions: true,
  captionDelay: 250,
  captionsData: 'alt',
};

const lightboxGallery = new SimpleLightbox('.gallery a', lightboxOptions);
