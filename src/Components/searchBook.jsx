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
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  const booksPerPage = 20;

  const getImageUrl = (cover_i) =>
    cover_i
      ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
      : "https://via.placeholder.com/150";

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
      setResults(books);
      setCurrentPage(1);
      setLoading(false);
    } catch (error) {
      console.error("Search Error:", error);
      toast.error("Failed to fetch books.");
      setLoading(false);
    }
  };

  const handleRating = async (editionKey, rating) => {
    if (!editionKey) {
      toast.error("cover_edition_key is missing");
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
        { bookId: editionKey, rating: parseFloat(rating) },
        { headers: { "x-access-token": token } }
      );

      toast.success("Book rated successfully!");

      // Update specific book's rating
      const updateRatingInList = (books) =>
        books.map((book) =>
          book.cover_edition_key === editionKey
            ? { ...book, rating: res.data.rating || parseFloat(rating) }
            : book
        );

      setResults((prev) => updateRatingInList(prev));
      setRecommendations((prev) => updateRatingInList(prev));
      setRatings((prev) => ({ ...prev, [editionKey]: "" }));
    } catch (error) {
      console.error("Rating Error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to rate book. Please try again.";
      toast.error(errorMsg);
    }
  };

  const handleGetRecommendations = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in to get recommendations");
      return;
    }

    try {
      setRecLoading(true);
      const res = await axios.get("/books/recommendations", {
        headers: { "x-access-token": token },
      });

      const books = res.data.books || res.data.results || res.data.recommendations || res.data || [];
      setRecommendations(Array.isArray(books) ? books : []);
      setRecLoading(false);
    } catch (error) {
      console.error("Recommendations Error:", error);
      const errorMsg =
        error.response?.data?.message || "Failed to fetch recommendations.";
      toast.error(errorMsg);
      setRecLoading(false);
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

  const renderBookCard = (book, listType = "search") => {
    const editionKey = book.cover_edition_key;
    const key = editionKey || book.key || `${listType}-${Math.random()}`;

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
          ★ Rating: {book.rating || "Not rated"}
        </p>
        {editionKey && (
          <div className="mt-2">
            <input
              type="number"
              min="1"
              max="5"
              step="0.5"
              value={ratings[editionKey] || ""}
              onChange={(e) =>
                setRatings((prev) => ({ ...prev, [editionKey]: e.target.value }))
              }
              placeholder="Rate 1-5"
              className="w-full p-1 rounded-md border text-sm mb-1"
            />
            <button
              onClick={() => handleRating(editionKey, ratings[editionKey])}
              className="w-full bg-green-600 text-white text-sm py-1 rounded-md hover:bg-green-500 transition"
            >
              Submit Rating
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
        backgroundImage: "url('/assets/backgroundHome.png')",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-4xl mx-auto bg-white/30 backdrop-blur-md p-6 rounded-lg shadow-lg">
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
          <button
            onClick={handleGetRecommendations}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-500 transition"
            disabled={recLoading}
          >
            {recLoading ? "Loading..." : "Get Recommendations"}
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : currentBooks.length > 0 ? (
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Search Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentBooks.map((book) => renderBookCard(book, "search"))}
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

        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Recommended Books</h2>
          {recLoading ? (
            <div className="text-center text-white">Loading recommendations...</div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {recommendations.map((book) => renderBookCard(book, "recommend"))}
            </div>
          ) : (
            <p className="text-white text-center">
              No recommendations available. Try rating more books!
            </p>
          )}
        </div>

        <ToastContainer position="top-center" theme="dark" />
      </div>
    </div>
  );
}
