import { useState } from "react";
import axios from "./api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SearchBook() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ratings, setRatings] = useState({});
  const [reviews, setReviews] = useState({});

  const booksPerPage = 20;

  const getImageUrl = (cover_i) =>
    cover_i
      ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
      : "https://via.placeholder.com/150";

  const normalizeWorkKey = (workKey) => {
    if (!workKey) return null;
    let normalized = workKey.trim();
    if (normalized.startsWith("/works/")) {
      normalized = normalized.replace(/^\/works\//, "");
    }
    normalized = normalized.toUpperCase();
    if (!/^OL\d+W$/.test(normalized)) {
      console.warn(`Invalid work_key format: ${normalized}`);
      return null;
    }
    return normalized;
  };

  const fetchRatingsForBooks = async (bookList) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No token found, skipping ratings fetch.");
      return {};
    }

    const workKeys = bookList
      .map((book) => normalizeWorkKey(book.work_key || book.key))
      .filter(Boolean);

    if (!workKeys.length) {
      console.warn("No valid work keys to fetch ratings.");
      return {};
    }

    try {
      const res = await axios.get("/books/rate", {
        params: { work_keys: workKeys.join(",") },
        headers: { "x-access-token": token },
      });

      if (!res.data.ratings) {
        console.warn("No ratings data in response:", res.data);
        return {};
      }

      return res.data.ratings;
    } catch (error) {
      console.error("Rating Fetch Error:", error);
      if (error.response?.status === 404) {
        toast.error("Ratings endpoint not found. Please contact support.");
      } else {
        toast.error("Failed to fetch ratings and reviews.");
      }
      return {};
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to search books");
        setLoading(false);
        return;
      }

      const res = await axios.get("/books/search", {
        params: { query: searchTerm },
        headers: { "x-access-token": token },
      });

      const books = res.data.books || res.data.docs || res.data.results || res.data || [];

      const normalizedBooks = books.map((book) => ({
        ...book,
        work_key: normalizeWorkKey(book.work_key || book.key),
      }));

      const ratingMap = await fetchRatingsForBooks(normalizedBooks);

      const booksWithRatings = normalizedBooks.map((book) => ({
        ...book,
        averageRating: ratingMap[book.work_key]?.averageRating || null,
        ratings: ratingMap[book.work_key]?.ratings || [],
      }));

      setResults(booksWithRatings);
      setCurrentPage(1);
      setLoading(false);
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Failed to fetch books.");
      setLoading(false);
    }
  };

  const handleRating = async (workKey, rating, review) => {
    const normalizedWorkKey = normalizeWorkKey(workKey);
    if (!normalizedWorkKey) {
      toast.error("Invalid work_key format");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please enter a rating between 1 and 5");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to rate books");
      return;
    }

    try {
      const res = await axios.post(
        "/books/rate",
        { work_key: normalizedWorkKey, rating: parseFloat(rating), review },
        { headers: { "x-access-token": token } }
      );

      toast.success("Book rated successfully!");

      setResults((prev) =>
        prev.map((book) =>
          book.work_key === normalizedWorkKey
            ? {
                ...book,
                averageRating: res.data.book.averageRating || parseFloat(rating),
                ratings: res.data.book.ratings || [],
              }
            : book
        )
      );
      setRatings((prev) => ({ ...prev, [normalizedWorkKey]: "" }));
      setReviews((prev) => ({ ...prev, [normalizedWorkKey]: "" }));
    } catch (error) {
      console.error("Rating Error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to rate book. Please try again.";
      toast.error(errorMsg);
    }
  };

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = results.slice(indexOfFirstBook, indexOfLastBook);

  const nextPage = () => {
    if (indexOfLastBook < results.length) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const renderBookCard = (book) => {
    const workKey = normalizeWorkKey(book.work_key);
    const key = workKey || book.key || `search-${Math.random()}`;

    return (
      <div
        key={key}
        className="bg-white/90 p-4 rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer"
      >
        <img
          src={getImageUrl(book.cover_i)}
          alt={book.title || "Book cover"}
          className="w-full h-48 object-cover rounded-md mb-2"
        />
        <h3 className="text-lg font-semibold text-gray-800">
          {book.title || "Untitled"}
        </h3>
        <p className="text-gray-600 text-sm">
          Author: {book.author_name ? book.author_name.join(", ") : "Unknown"}
        </p>
        <p className="text-gray-700 text-xs">
          📅 Year: {book.first_publish_year || "N/A"}
        </p>
        <p className="text-yellow-600 text-sm mt-1">
          ★ Rating: {book.averageRating ? book.averageRating.toFixed(1) : "Not rated"}
        </p>
        <div className="mt-2">
          <h4 className="text-sm font-semibold text-gray-800">Reviews</h4>
          {book.ratings?.length > 0 ? (
            <ul className="list-disc pl-5 text-gray-600 text-xs">
              {book.ratings
                .filter((r) => r.review)
                .map((r, index) => (
                  <li key={index}>
                    {r.review} (Rating: {r.rating})
                  </li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-600 text-xs">No reviews yet.</p>
          )}
        </div>
        {workKey && (
          <div className="mt-2">
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={ratings[workKey] || ""}
              onChange={(e) =>
                setRatings((prev) => ({ ...prev, [workKey]: e.target.value }))
              }
              placeholder="Rate 1-5"
              className="w-full p-1 rounded-md border text-sm mb-1"
            />
            <textarea
              value={reviews[workKey] || ""}
              onChange={(e) =>
                setReviews((prev) => ({ ...prev, [workKey]: e.target.value }))
              }
              placeholder="Write a review..."
              className="w-full p-1 rounded-md border text-sm mb-1 h-16"
            />
            <button
              onClick={() => handleRating(book.work_key, ratings[workKey], reviews[workKey])}
              className="w-full bg-green-600 text-white text-sm py-1 rounded-md hover:bg-green-500 transition"
            >
              Submit Rating & Review
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4"
      style={{
        backgroundImage: "url('/assets/backgroundHome.webp')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-0 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-4 text-center">🔍 Search Books</h1>

        <div className="flex items-center gap-4 mb-6">
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter book title or author..."
            className="flex-1 px-4 py-2 rounded-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-500 transition"
          >
            Search
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : currentBooks.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentBooks.map((book) => renderBookCard(book))}
            </div>
            {results.length > booksPerPage && (
              <div className="flex justify-between mt-6">
                <button
                  onClick={prevPage}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:bg-gray-300"
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:bg-gray-300"
                  disabled={indexOfLastBook >= results.length}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white text-center">No books found.</p>
        )}

        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}