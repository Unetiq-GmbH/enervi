const Logo = () => {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img
        src="/images/enervi_logo.png"
        alt="logo"
        style={{ width: "150px" }}
      />
      <span
        style={{
          position: "absolute",
          top: "74%",
          left: "74%",
          fontSize: "12px",
          fontWeight: "bold",
          color: "var(--primary-color)",
          padding: "1px 4px",
          borderRadius: "3px",
        }}
      >
        BETA
      </span>
    </div>
  );
};

export default Logo;
