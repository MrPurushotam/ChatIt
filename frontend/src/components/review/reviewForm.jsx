import { useState } from "react";
import initalizeApi from "../../utils/Api";
import ToastNotification, { showToast } from "../toast";
import Loader from "../Loader"; // Import the Loader component

const FeedbackForm = ({ username, id }) => {
    const api = initalizeApi();
    const [formData, setFormData] = useState({
        name: username || "",
        feedbackAbout: "",
        description: "",
        image: null,
    });
    const [feedbackAboutWordCount, setFeedbackAboutWordCount] = useState(0);
    const [descriptionWordCount, setDescriptionWordCount] = useState(0);
    const [loading, setLoading] = useState(false); // Add loading state

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "feedbackAbout") {
            const charCount = value.length;
            if (charCount > 500) return;
            setFeedbackAboutWordCount(charCount);
        }

        if (name === "description") {
            const charCount = value.length;
            if (charCount > 1200) return;
            setDescriptionWordCount(charCount);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Set loading to true when form is submitted
        console.log("Form submitted:", formData);
        try {
            const res = await api.post("/review", formData);
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setLoading(false); // Set loading to false after request is complete
        }
    };

    return (
        <>
            <ToastNotification />
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-lg mx-auto shadow-sm shadow-gray-600 p-4 rounded">
                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        disabled={loading}
                        value={formData.name}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        required
                        readOnly={!!id}
                    />
                </label>
                <label>
                    Feedback About (Max 500 Characters):
                    <textarea
                        name="feedbackAbout"
                        value={formData.feedbackAbout}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        disabled={loading}
                        required
                    ></textarea>
                    <p className="text-sm text-gray-600">{feedbackAboutWordCount}/500 characters</p>
                </label>
                <label>
                    Description (Max 1200 Characters):
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        disabled={loading}
                        required
                    ></textarea>
                    <p className="text-sm text-gray-600">{descriptionWordCount}/1200 characters</p>
                </label>
                <label>
                    Upload Image (optional):
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border p-2 w-full"
                        disabled={loading}
                    />
                </label>
                <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center">
                    {loading ? <Loader color="white" /> : "Submit "}
                </button>
            </form>
        </>
    );
};

export default FeedbackForm;
