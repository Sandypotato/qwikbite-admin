// src/components/food/Add.jsx
import React, { useState, useContext, useEffect } from "react";
import "./Add.css";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Add = ({ url }) => {
  const navigate = useNavigate();
  const { token, admin } = useContext(StoreContext);

  // NOTE: Changed default category to match one of your <option> values
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Drinks Stall",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in / not admin
  useEffect(() => {
    if (!admin || !token) {
      toast.error("Please Login First");
      navigate("/");
    }
  }, [admin, token, navigate]);

  const onChangeHandler = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  // If you just want to send the raw File to your backend as multipart:
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);
    try {
      // OPTION A: If your backend expects a binary file (multipart/form-data),
      // simply do:
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("price", Number(data.price));
      formData.append("category", data.category);
      formData.append("image", imageFile); // raw File object

      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          token: token,
        },
      });

      if (response.data.success) {
        // Clear the form
        setData({
          name: "",
          description: "",
          price: "",
          category: "Drinks Stall",
        });
        setImageFile(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // If your backend *actually* wants Base64 on input, use FileReader:
  /*
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please upload an image");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Read the file as Data URL
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // reader.result is something like "data:image/png;base64,XXXXX"
          // We split off the prefix so we send only the Base64 payload.
          const [prefix, payload] = reader.result.split(",");
          resolve(payload);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(imageFile);
      });

      // 2. Now build a JSON or FormData that includes that Base64.
      // If your backend expects JSON:
      const payload = {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        category: data.category,
        imageBase64: base64String,
      };

      const response = await axios.post(`${url}/api/food/add/base64`, payload, {
        headers: {
          "Content-Type": "application/json",
          token: token,
        },
      });

      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Drinks Stall",
        });
        setImageFile(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };
  */

  return (
    <div className="add">
      <form onSubmit={onSubmitHandler} className="flex-col">
        <div className="add-img-upload flex-col">
          <p>Upload image</p>
          <label htmlFor="image">
            <img
              src={imageFile ? URL.createObjectURL(imageFile) : assets.upload_area}
              alt="upload-preview"
            />
          </label>
          <input
            onChange={(e) => setImageFile(e.target.files[0])}
            type="file"
            id="image"
            accept="image/*"
            hidden
            required
          />
        </div>

        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="Type here"
            required
          />
        </div>

        <div className="add-product-description flex-col">
          <p>Product description</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="6"
            placeholder="Write content here"
            required
          />
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Product category</p>
            <select
              name="category"
              value={data.category}
              onChange={onChangeHandler}
              required
            >
              <option value="Drinks Stall">Drinks Stall</option>
              <option value="Prata Stall">Prata Stall</option>
              <option value="Mix Veg Rice">Mix Veg Rice</option>
              <option value="Noodles Stall">Noodles Stall</option>
              <option value="Thai">Thai</option>
              <option value="Western">Western</option>
              <option value="Yong Tau Foo">Yong Tau Foo</option>
              <option value="Fruits Stall">Fruits Stall</option>
            </select>
          </div>

          <div className="add-price flex-col">
            <p>Product price</p>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              placeholder="$20"
              required
            />
          </div>
        </div>

        <button type="submit" className="add-btn" disabled={isSubmitting}>
          {isSubmitting ? "Uploading…" : "ADD"}
        </button>
      </form>
    </div>
  );
};

export default Add;
