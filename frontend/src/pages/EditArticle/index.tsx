import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArticleForm from "@/components/ArticleForm";
import Loader from "@/components/UI/Loader";
import { useShortById } from "@/hooks/api/short";

const EditArticle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [short, isLoadingShort] = useShortById(id!);

  useEffect(() => {
    if (!isLoadingShort && !short) {
      navigate("/not-found");
    }
  }, [isLoadingShort, short, navigate]);

  if (isLoadingShort) {
    return <Loader />;
  }

  return <ArticleForm isEditing={true} initialData={short} />;
};

export default EditArticle;
