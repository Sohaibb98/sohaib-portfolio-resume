<template>
  <div class="welcome-container">
    <h1 class="welcome-message">Greetings from Sohaib!</h1>
    <div class="quote-section">
      <img src="/Sohaib.PNG" alt="Profile Picture" class="profile-pic" />
      <blockquote class="intro-text">
        <span class="quote-mark opening">"</span>
            This portfolio is my playground to practice and demonstrate my skills as a Software Developer in all areas such as Backend, Frontend, DevOps, Database Management and Cyber!
        <span class="quote-mark closing">"</span>
      </blockquote>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Welcome',
};
</script>

<style scoped>
.welcome-container {    
  padding: 80px;
  background-color: #000000;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.welcome-message {
  font-size: 28px;
  margin-bottom: 30px;
  color: #ffffff;
}

.quote-section {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.intro-text {
  font-size: 24px;
  line-height: 1.8;
  color: #ffffff;
  font-style: italic;
  text-align: center;
  position: relative;
  padding: 40px 20px;
  background-color: #000000;
  border-radius: 4px;
  margin: 20px 0;
  flex: 1;
}

.quote-mark {
  font-size: 48px;
  color: #ffa500;
  font-weight: bold;
  line-height: 0.5;
  margin: 0 8px;
  vertical-align: middle;
}

.quote-mark.opening {
  margin-right: 12px;
}

.quote-mark.closing {
  margin-left: 12px;
}

.profile-pic {
    display: block;
    width: 160px;
    height: 160px;
    /* border: 5px solid var(--highlight-color-left); */
    object-fit: cover;
    border-radius: 50%;
    flex-shrink: 0;
}

</style>