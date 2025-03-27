import { useState } from "react";
import initalizeApi from "../../utils/Api";
import ToastNotification, { showToast } from "../toast";
import Loader from "../Loader";

const FeedbackForm = () => {
    const api = initalizeApi();
    const [formData, setFormData] = useState({
        fullname: "",
        subject: "",
        description: "",
    });
    const [feedbackAboutWordCount, setFeedbackAboutWordCount] = useState(0);
    const [descriptionWordCount, setDescriptionWordCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === "subject") {
            const charCount = value.length;
            if (charCount > 200) return;
            setFeedbackAboutWordCount(charCount);
        }

        if (name === "description") {
            const charCount = value.length;
            if (charCount > 1200) return;
            setDescriptionWordCount(charCount);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // const handleImageChange = (e) => {
    //     setFormData((prev) => ({ ...prev, image: e.target.files[0] }));
    // };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post("/review", formData);
            if (!res.data.success) {
                showToast(res.data.message, "error");
            }else{
                showToast(res.data.message, "success");
            }
        } catch (error) {
            showToast(error.message, "error");
        } finally {
            setLoading(false);
            setFormData({        
                fullname: "",
                subject: "",
                description: "",
            })
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
                        name="fullname"
                        disabled={loading}
                        value={formData.fullname}
                        onChange={handleChange}
                        className="border p-2 w-full"
                        required
                    />
                </label>
                <label>
                    Subject (Max 200 Characters):
                    <textarea
                        name="subject"
                        value={formData.subject}
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
                {/* <label>
                    Upload Image (optional):
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="border p-2 w-full"
                        disabled={loading}
                    />
                </label> */}
                <button type="submit" className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 flex items-center justify-center">
                    {loading ? <Loader color="white" size="xs" /> : "Submit "}
                </button>
            </form>
        </>
    );
};

export default FeedbackForm;
