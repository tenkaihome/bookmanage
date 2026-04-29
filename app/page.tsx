"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  X,
  Book as BookIcon,
  ExternalLink
} from "lucide-react";
import { getBooks, deleteBook, createBook, updateBook, Book } from "@/lib/api";

export default function BookManagePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    price: "",
    publisher: "",
    pages: ""
  });
  const [bookFile, setBookFile] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await getBooks();
      setBooks(response.data);
    } catch (error) {
      console.error("Failed to fetch books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return;
    try {
      await deleteBook(id);
      setBooks(books.filter(b => b.id !== id));
    } catch (error) {
      alert("Failed to delete book");
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description,
      category: book.category,
      price: book.price,
      publisher: book.details?.Publisher || "",
      pages: book.details?.Pages || ""
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      description: "",
      category: "",
      price: "",
      publisher: "",
      pages: ""
    });
    setBookFile(null);
    setCoverImage(null);
    setEditingBook(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingBook) {
        // Update basic info (backend doesn't handle file update in put yet, keeping it simple)
        await updateBook(editingBook.id, {
          ...formData,
          details: { Publisher: formData.publisher, Pages: formData.pages }
        });
      } else {
        const data = new FormData();
        data.append("title", formData.title);
        data.append("author", formData.author);
        data.append("description", formData.description);
        data.append("category", formData.category);
        data.append("price", formData.price);
        data.append("details", JSON.stringify({ Publisher: formData.publisher, Pages: formData.pages }));
        
        if (bookFile) data.append("file", bookFile);
        if (coverImage) data.append("cover", coverImage);

        await createBook(data);
      }
      
      await fetchBooks();
      resetForm();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Operation failed. Check console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <BookIcon className="w-8 h-8 text-indigo-600" />
              Bookpatr Management
            </h1>
            <p className="text-slate-500 mt-1">Manage your literary collection and archival files.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus className="w-5 h-5" />
            Add New Book
          </button>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search by title or author..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500 font-medium">
              Showing {filteredBooks.length} books
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                  <th className="px-6 py-4">Book Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Files</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-500 mb-2" />
                      <span className="text-slate-400">Loading your collection...</span>
                    </td>
                  </tr>
                ) : filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <p className="text-slate-400">No books found matching your criteria.</p>
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0 shadow-sm border border-slate-200">
                            {book.cover_url ? (
                              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">{book.title}</div>
                            <div className="text-sm text-slate-500">{book.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-full border border-indigo-100">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">{book.price}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {book.file_url ? (
                            <a href={book.file_url} target="_blank" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors" title="Download Book">
                              <FileText className="w-4 h-4" />
                            </a>
                          ) : (
                            <span className="text-slate-300 text-xs">No file</span>
                          )}
                          {book.cover_url && (
                             <a href={book.cover_url} target="_blank" className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-indigo-100 hover:text-indigo-600 transition-colors" title="View Cover">
                               <ExternalLink className="w-4 h-4" />
                             </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(book)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(book.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-bold text-slate-800">
                {editingBook ? "Edit Book Details" : "Add New Volume"}
              </h2>
              <button onClick={resetForm} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Book Title</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Author</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.author}
                    onChange={(e) => setFormData({...formData, author: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                  <select 
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Non-Fiction">Non-Fiction</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Classic">Classic</option>
                    <option value="Poetry">Poetry</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Price (e.g. $24.00)</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                <div className="col-span-1">
                   <label className="block text-sm font-bold text-slate-700 mb-2">Pages</label>
                   <input 
                     type="text" 
                     className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                     value={formData.pages}
                     onChange={(e) => setFormData({...formData, pages: e.target.value})}
                   />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>

              {!editingBook && (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> Book File (PDF/EPUB)
                    </label>
                    <input 
                      type="file" 
                      accept=".pdf,.epub,.doc,.docx"
                      onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Cover Image
                    </label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
                      className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="flex-1 px-6 py-4 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  disabled={isSubmitting}
                  type="submit" 
                  className="flex-2 px-12 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
                  {editingBook ? "Save Changes" : "Archive Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
