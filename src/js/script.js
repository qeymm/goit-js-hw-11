import { BASE_URL, options } from "./pixabay-api.js";
import axios from "axios";
import { Notify } from "notiflix/build/notiflix-notify-aio.js";
import SimpleLightbox from "simplelightbox";
import 'simplelightbox/dist/simple-lightbox.min.css';


// ELEMENTS

const galleryEl = document.querySelector('.gallery')
const searchInputEl = document.querySelector('input[name = "searchQuery"]')
const searchFormEl = document.getElementById("search-form")

let reachEnd = false;
let totalHits = 0;
let isLoading = false;
let lightbox = new SimpleLightbox('.gallery a.lightbox');

function renderGallery(hits) {
    const markup = hits.map(
        ({
            webformatURL,
            largeImageURL,
            tags,
            likes,
            views,
            comments,
            downloads
        }) => {
            return `
                <a href="${largeImageURL}" class="lightbox">
                    <div class="photo-card">
                        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
                        <div class="info">
                            <p class="info-item">
                                <b>Likes</b>
                                ${likes}
                            </p>
                            <p class="info-item">
                                <b>Views</b>
                                ${views}
                            </p>
                            <p class="info-item">
                                <b>Comments</b>
                                ${comments}
                            </p>
                            <p class="info-item">
                                <b>Downloads</b>
                                ${downloads}
                            </p>
                        </div>
                    </div>
                </a>
            `;
        }
    ).join('');
    
    galleryEl.insertAdjacentHTML('beforeend', markup);

    if (options.params.page * options.params.per_page >= totalHits) {
        if (!reachEnd) {
            Notify.info("We're sorry, but you've reached the end of search results");
            reachEnd = true;
        }
    }
    lightbox.refresh();
}



async function handleSubmit(e) {
    e.preventDefault();
    options.params.q = searchInputEl.value.trim();
    
    if (options.params.q === "") {
        Notify.warning("Please enter a search query");
        return;
    }
    
    options.params.page = 1;
    galleryEl.innerHTML = "";
    reachEnd = false;
    isLoading = false;

    try {
        const res = await axios.get(BASE_URL, options);
        totalHits = res.data.totalHits;
        const { hits } = res.data;
        
        if (hits.length === 0) {
            Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        } else {
            Notify.success(`Hooray! We found ${totalHits} images`);
            renderGallery(hits);
        }
    } catch (error) {
        Notify.failure(`Error: ${error.message}`);
    }
}

async function loadMore() {
    if (reachEnd || isLoading) return;
    
    try {
        isLoading = true;
        options.params.page += 1;
        const res = await axios.get(BASE_URL, options);
        const hits = res.data.hits;
        
        if (hits.length > 0) {
            renderGallery(hits);
        }
    } catch (error) {
        Notify.failure(`Error loading more images: ${error.message}`);
    } finally {
        isLoading = false;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const handleScroll = debounce(() => {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    
    // Load more when user is near the bottom (100px threshold)
    if (scrollHeight - (scrollTop + clientHeight) < 100 && !reachEnd && !isLoading) {
        loadMore();
    }
}, 300);
    
searchFormEl.addEventListener("submit", handleSubmit);
window.addEventListener('scroll', handleScroll);