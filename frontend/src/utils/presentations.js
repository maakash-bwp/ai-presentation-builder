export const filterPresentations = ({
  presentations,
  query = "",
  filter = "recent",
  template = "all"
}) => {
  const normalizedQuery = query.trim().toLowerCase();

  return [...presentations]
    .filter((presentation) => {
      const matchesQuery =
        !normalizedQuery ||
        presentation.title?.toLowerCase().includes(normalizedQuery) ||
        presentation.prompt?.toLowerCase().includes(normalizedQuery) ||
        presentation.template?.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filter === "favorite" ? presentation.isFavorite : true;

      const matchesTemplate =
        template === "all" ? true : presentation.template === template;

      return matchesQuery && matchesFilter && matchesTemplate;
    })
    .sort((left, right) => {
      if (filter === "date") {
        return new Date(left.createdAt) - new Date(right.createdAt);
      }
      return new Date(right.updatedAt) - new Date(left.updatedAt);
    });
};
