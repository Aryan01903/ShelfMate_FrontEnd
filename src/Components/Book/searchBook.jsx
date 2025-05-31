import { useState } from "react";
import axios from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SearchBook() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const booksPerPage = 20;

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a search term");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get("/books/search", {
        params: { query: searchTerm },
        headers: {
          "x-access-token": localStorage.getItem("token"),
        },
      });

      console.log("Full Response:", res.data);
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

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = results.slice(indexOfFirstBook, indexOfLastBook);

  const nextPage = () => {
    if (indexOfLastBook < results.length) setCurrentPage((prev) => prev + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const getImageUrl = (cover_i) => {
    return cover_i
      ? `https://covers.openlibrary.org/b/id/${cover_i}-L.jpg`
      : "https://via.placeholder.com/150";
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4"
      style={{ 
        backgroundImage: "url('/assets/backgroundHome.png')",
        backgroundAttachment: "fixed"
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
        </div>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : currentBooks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentBooks.map((book, index) => (
              <div
                key={index}
                className="bg-white/90 p-4 rounded-xl shadow-lg hover:shadow-2xl transition cursor-pointer"
              >
                <img
                  src={getImageUrl(book.cover_i)}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded-md mb-2"
                />
                <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
                <p className="text-gray-600 text-sm">
                  Author: {book.author_name ? book.author_name.join(", ") : "Unknown"}
                </p>
                <p className="text-gray-700 text-xs">
                  📅 Year: {book.first_publish_year || "N/A"}
                </p>
                <p className="text-yellow-600 text-sm mt-1">⭐ Rating: {book.rating || "Not rated"}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white text-center">No books found.</p>
        )}

        {results.length > booksPerPage && (
          <div className="flex justify-between mt-6">
            <button
              onClick={prevPage}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:bg-cyan-300"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              onClick={nextPage}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md disabled:bg-cyan-300"
              disabled={indexOfLastBook >= results.length}
            >
              Next
            </button>
          </div>
        )}
      </div>

      <ToastContainer position="top-center" theme="dark" />
    </div>
  );
}
