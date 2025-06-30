export const BASE_URL = "https://pixabay.com/api/";
const API_KEY = "51112360-6ba7af76f8c8cdf9e0f2073de";

export const options = {
    params: {
        key: API_KEY,
        q: '',
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: 1,
        per_page: 40,
    }
};