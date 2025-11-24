<template>
  <main class="container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading resume data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Failed to load resume data</h3>
      <p>{{ error }}</p>
      <button @click="fetchResumeData" class="retry-btn">Retry</button>
    </div>

    <!-- Resume Content -->
    <div v-else>
      <!-- Sticky static search bar at the top of the resume -->
    <div class="resume-search-bar">
      <div style="position:relative;width:100%;display:flex;justify-content:center;">
        <input
          type="search"
          class="resume-search-input"
          placeholder="Search for skills"
          aria-label="Search for skills"
          v-model="searchQuery"
          @input="onSearchInput"
          @focus="showSuggestions = true"
          @blur="hideSuggestions"
          autocomplete="off"
        />
        <ul v-if="showSuggestions && filteredSkills.length" class="resume-search-dropdown">
          <li v-for="(skill, idx) in filteredSkills" :key="idx" @mousedown.prevent="selectSkill(skill)" class="resume-search-suggestion">
            {{ skill }}
          </li>
        </ul>
      </div>
      
      <!-- Selected Skills Display -->
      <div v-if="selectedSkills.length" class="selected-skills-container">
        <div class="selected-skills-wrapper">
          <span class="selected-skills-label">Filtering by:</span>
          <div class="selected-skills-tags">
            <span v-for="(skill, idx) in selectedSkills" :key="idx" class="selected-skill-tag">
              {{ skill }}
              <button @click="removeSkill(skill)" class="remove-skill-btn">&times;</button>
            </span>
          </div>
          <button @click="clearAllSkills" class="clear-all-btn">Clear All</button>
        </div>
      </div>
    </div>
    <div id="resume" class="d-flex">
      <div class="left-col">
        <div class="resume-section">
          <h4 class="section-headline">{{ headlines.about }}</h4>
          <div>{{ introText }}</div>
        </div>

        <div class="resume-section">
          <h4 class="section-headline">{{ headlines.contact }}</h4>
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <i class="fa-solid fa-envelope" style="margin-right: 6px; font-size: 15px;"></i>
              <span>{{ contact.email }}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px; margin: 5px 0;">
              <i class="fa-brands fa-linkedin" style="margin-right: 6px; font-size: 15px;"></i>
              <span>{{ contact.linkedin }}</span>
            </div>

            <div v-for="(m, idx) in contact.mobiles" :key="idx" style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
              <i class="fa-solid fa-mobile-screen" style="margin-right: 6px; font-size: 15px;"></i>
              <span>{{ m.number }}</span>

              <!-- Call Icon -->
              <span v-if="m.callStatus === 'active'">
                <a :href="`tel:${m.number}`" target="_blank" :title="`tel:${m.number}`" style="color: inherit;">
                  <i class="fa-solid fa-phone" style="font-size: 20px; cursor: pointer;"></i>
                </a>
              </span>

              <span v-else :title="m.callStatus === 'temporarily off' ? 'Temporarily UnAvailable' : 'UnAvailable'"
                style="cursor:not-allowed;">
                <i class="fa-solid fa-phone" style="font-size: 20px; color: gray; opacity: 0.5;"></i>
              </span>

              <!-- WhatsApp Icon -->
              <span v-if="m.whatsappStatus === 'active'">
                <a :href="`https://wa.me/${m.number}`" target="_blank" :title="`https://wa.me/${m.number}`" style="color: inherit;">
                  <i class="fa-brands fa-whatsapp" style="font-size: 20px; cursor: pointer;"></i>
                </a>
              </span>

              <span v-else :title="m.whatsappStatus === 'temporarily off' ? 'Temporarily UnAvailable' : 'UnAvailable'"
                style="cursor:not-allowed;">
                <i class="fa-brands fa-whatsapp" style="font-size: 20px; color: gray; opacity: 0.5;"></i>
              </span>
            </div>
          </div>
        </div>

        <div class="resume-section">
          <h4 class="section-headline">{{ headlines.visa }}</h4>
          <div v-for="(visa, country) in visa" :key="country"
            :class="visa.cur_loc ? 'visa-row visa-current' : 'visa-row'"
            style="display: flex; align-items: center; gap: 8px; margin-top: 6px;">
            <img :src="visa.flag_path" :alt="country + ' flag'" style="width: 20px; height: 15px; object-fit: cover;" :title="visa.city + ', ' + country" />
            <span>| {{ visa.type }}</span>
            <span v-if="visa.type && visa.type.toLowerCase().includes('visa')">| {{ visa.validity }}</span>
            <span v-if="visa.cur_loc" style="margin-left: auto;" :title="'Currently here'">
              <i class="fa-solid fa-location-dot" style="color: #d00; font-size: 15px;"></i>
            </span>
          </div>
        </div>

        <div class="resume-section">
          <h4 class="section-headline">{{ headlines.skills }}</h4>
          <ul>
            <li v-for="skill in skills">{{ skill }}</li>
          </ul>
        </div>
        
          <div class="resume-section">
            <h4 class="section-headline">{{ headlines.tech_profiles }}</h4>
          <a v-for="(p, idx) in codingProfiles" :key="idx" :href="p.link" target="_blank" :title="p.link" style="margin-top: 6px; display: flex; align-items: center; gap: 6px; color: inherit; text-decoration: underline;">
            <span style="font-weight: 500;">{{ p.name }}</span>
            <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 12px; color: inherit;"></i>
          </a>
        </div>
      </div>

      <div class="right-col">
        <div class="personal-name">{{ name }}</div>
        <div class="personal-title">{{ title }}</div>

        <div class="resume-section">
          <h4 class="section-headline">{{ headlines.experience }}</h4>
          <div v-for="(company, ci) in filteredExperiences" :key="ci" class="inner-section">
            <div class="company">
              <span><img :src="company.image" alt="logo" height="25" /></span>
              {{ company.company }}
            </div>

            <div v-for="(pos, pi) in company.positions" :key="pi" class="position-block">
                <!-- <div class="d-flex justify-content-between"> 
                    <div class="role-duration">{{ pos.title }}</div>
                    <div v-if="pos.duration">{{ pos.duration.start }} - {{
                    pos.duration.end }}</div>
                </div> -->

                <div class="d-flex justify-content-between"> 
                    <div class="project-position">{{ pos.title }}</div>
                    <div  v-if="pos.duration" class="project-duration" >{{ pos.duration.start }} - {{
                    pos.duration.end }}</div>
                </div>

              <ul v-if="pos.projects && pos.projects.length">
                <li v-for="(p, pk) in pos.projects" :key="pk" class="project">
                  <div class="project-title">{{ p.title }}
                    <!-- <span v-if="p.duration"> — {{ p.duration.start }} - {{
                      p.duration.end }}</span> -->
                    </div>
                  <div class="project-position" v-if="p.position"><b>Role: </b>{{ p.position }}</div>
                  <div v-if="p.description" class="proj-desc">{{ p.description }}</div>
                  <ul v-if="p.bullets && p.bullets.length">
                    <li v-for="(b, bi) in p.bullets" :key="bi">{{ b }}</li>
                  </ul>
                  <div v-if="p.skills && p.skills.length" class="project-skills">
                    <span v-for="(skill, si) in p.skills" :key="si" class="skill-tag">{{ skill }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div v-if="projects && projects.length > 0" class="resume-section">
          <h4 class="section-headline">{{ headlines.projects || 'Projects' }}</h4>
          <div v-for="(project, pi) in filteredProjects" :key="pi" class="inner-section">
            <div class="project-header">
              <h5>{{ project.title }}</h5>
            </div>
            <div class="d-flex justify-content-between"> 
                    <div class="project-position">{{ project.position }}</div>
                    <div v-if="project.duration" class="project-duration" >{{ project.duration.start }} - {{
              project.duration.end }}</div>
            </div>
            <div v-if="project.description" class="project-description">
              {{ project.description }}
            </div>
            <ul v-if="project.bullets && project.bullets.length" class="project-bullets">
              <li v-for="(bullet, bi) in project.bullets" :key="bi">{{ bullet }}</li>
            </ul>
            <div v-if="project.skills && project.skills.length" class="project-skills">
              <span v-for="(skill, si) in project.skills" :key="si" class="skill-tag">{{ skill }}</span>
            </div>
          </div>
        </div>

        
        <div class="resume-section">
          <h4 class="section-headline">{{ headlines.education }}</h4>

          <div v-for="(edu, ei) in education" :key="ei" class="inner-section">
            <div class="education-title">{{ edu.title }}</div>
            <div class="d-flex justify-content-between">
                <div class="education-institute">{{ edu.institute }}, {{ edu.location }}</div>
                <div v-if="edu.duration" class="education-duration">{{ edu.duration.start }} - {{ edu.duration.end }}</div>
            </div>
            <ul v-if="edu.description && edu.description.length">
              <li v-for="(bullet, bi) in edu.description" :key="bi">{{ bullet }}</li>
            </ul>
          </div>
        </div>

        <div class="certifications-bordered-section">
          <div class="resume-section">
            <div class="certifications-header">
              <h4 class="section-headline">{{ headlines.certifications }}</h4>
              <div class="view-toggle-buttons">
                <button 
                  @click="certificationViewMode = 'list'" 
                  :class="['view-toggle-btn', { 'active': certificationViewMode === 'list' }]"
                  title="List View"
                >
                  <i class="fa-solid fa-list"></i>
                </button>
                <button 
                  @click="certificationViewMode = 'grid'" 
                  :class="['view-toggle-btn', { 'active': certificationViewMode === 'grid' }]"
                  title="Grid View"
                >
                  <i class="fa-solid fa-th-large"></i>
                </button>
              </div>
            </div>
              <div class="scrollable-section">
                  <!-- List View -->
                  <div v-if="certificationViewMode === 'list'" class="certification-list-view">
                      <div v-for="(cert, ci) in filteredCertifications" :key="ci" class="inner-section certification-card" @click="openCertModal(cert)">
                          <div class="d-flex justify-content-between">
                              <div class="certification-title">
                                  <span style="font-weight: bold; text-decoration: underline; cursor: pointer;">{{ cert.title }}</span>
                              </div>
                              <div class="certification-date">{{ cert.date }}</div>
                          </div>
                          <div class="certification-description">{{ cert.description }}</div>
                          <div class="certification-issuer"><b>Issued By: </b> {{ cert.issued_by}}</div>
                          <div class="certification-type"><b>Type: </b> {{ cert.type }}</div>
                      </div>
                  </div>
                  
                  <!-- Grid View -->
                  <div v-if="certificationViewMode === 'grid'" class="certification-grid-view">
                      <div v-for="(cert, ci) in filteredCertifications" :key="ci" class="certification-grid-item" @click="openCertModal(cert)" :title="cert.title">
                          <img 
                              :src="cert.image_path" 
                              :alt="cert.title + ' Certificate'"
                              class="certification-grid-image"
                              @error="handleGridImageError"
                          />
                      </div>
                  </div>
              </div>   
          </div>
        </div>

      </div>
    </div>>

    <!-- Certification Modal -->
    <div v-if="showCertModal" class="cert-modal-overlay" @click="closeCertModal">
      <div class="cert-modal-content" @click.stop>
        <div class="cert-modal-header">
          <h3>{{ selectedCert?.title }}</h3>
          <button @click="closeCertModal" class="cert-modal-close">&times;</button>
        </div>
        <div class="cert-modal-body">
          <img 
            v-if="selectedCert?.image_path" 
            :src="selectedCert.image_path" 
            :alt="selectedCert.title + ' Certificate'"
            class="cert-modal-image"
            @error="handleImageError"
            @load="handleImageLoad"
          />
          <div v-if="imageError" class="cert-modal-fallback">
            <p>Certificate image could not be loaded.</p>
          </div>
          <div v-if="!selectedCert?.image_path" class="cert-modal-fallback">
            <p>No certificate image available for this certification.</p>
          </div>
          <!-- View Certificate Button - only show if link is available -->
          <div v-if="selectedCert?.link" class="cert-modal-actions">
            <a :href="selectedCert.link" target="_blank" class="cert-modal-link">
              View Certificate <i class="fa-solid fa-external-link-alt"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
    </div> <!-- End of v-else content wrapper -->
  </main>
</template>

<script>
import ApiService from '@/services/ApiService.js';

export default {
  name: 'Resume',
  data() {
    return {
      // API Data
      personalInfo: null,
      contact: null,
      visa: {},
      skills: [],
      skillTags: [],
      experiences: [],
      education: [],
      certifications: [],
      codingProfiles: [],
      projects: [], // Combined projects from experiences and personal projects
      headlines: {
        about: "About Me",
        contact: "Contact", 
        skills: "Skills",
        experience: "Experience",
        projects: "Projects",
        education: "Education",
        visa: "Visa Status",
        certifications: "Certifications Gallery",
        tech_profiles: "Tech Profiles"
      },
      
      // Personal info for template
      name: '',
      title: '',
      introText: '',
      
      // UI State
      loading: true,
      error: null,
      showCertModal: false,
      selectedCert: null,
      imageError: false,
      certificationViewMode: 'list',
      searchQuery: '',
      showSuggestions: false,
      selectedSkills: []
    };
  },
  async mounted() {
    await this.fetchResumeData();
  },
  computed: {
    filteredSkills() {
      if (!this.searchQuery) return [];
      const query = this.searchQuery.toLowerCase();
      return this.skillTags.filter(skill => 
        skill.toLowerCase().includes(query) && 
        !this.selectedSkills.includes(skill)
      ).slice(0, 8); // Limit to 8 suggestions
    },
    filteredExperiences() {
      if (!this.selectedSkills.length) return this.experiences;
      
      return this.experiences.filter(experience => {
        return experience.positions.some(position => {
          return position.projects && position.projects.some(project => {
            return project.skills && project.skills.some(skill => 
              this.selectedSkills.includes(skill)
            );
          });
        });
      }).map(experience => ({
        ...experience,
        positions: experience.positions.filter(position => {
          return position.projects && position.projects.some(project => {
            return project.skills && project.skills.some(skill => 
              this.selectedSkills.includes(skill)
            );
          });
        })
      }));
    },
    filteredCertifications() {
      if (!this.selectedSkills.length) return this.certifications;
      
      return this.certifications.filter(cert => {
        return cert.skills && cert.skills.some(skill => 
          this.selectedSkills.includes(skill)
        );
      });
    },
    // Filter standalone projects by selected skills
    filteredProjects() {
      if (this.selectedSkills.length === 0) return this.projects;
      
      return this.projects.filter(project => {
        if (!project.skills) return false;
        return this.selectedSkills.some(selectedSkill =>
          project.skills.includes(selectedSkill)
        );
      });
    }
  },
  methods: {
    openCertModal(cert) {
      this.selectedCert = cert;
      this.showCertModal = true;
      this.imageError = false;
    },
    closeCertModal() {
      this.showCertModal = false;
      this.selectedCert = null;
      this.imageError = false;
    },
    handleImageError() {
      this.imageError = true;
    },
    handleImageLoad() {
      this.imageError = false;
    },
    handleGridImageError(event) {
      // Hide the image if it fails to load in grid view
      event.target.style.display = 'none';
    },
    onSearchInput() {
      this.showSuggestions = !!this.filteredSkills.length;
    },
    hideSuggestions() {
      // Delay to allow click selection
      setTimeout(() => { this.showSuggestions = false; }, 150);
    },
    selectSkill(skill) {
      this.selectedSkills.push(skill);
      this.searchQuery = '';
      this.showSuggestions = false;
      console.log('Selected skills:', this.selectedSkills);
    },
    removeSkill(skill) {
      const index = this.selectedSkills.indexOf(skill);
      if (index > -1) {
        this.selectedSkills.splice(index, 1);
      }
    },
    clearAllSkills() {
      this.selectedSkills = [];
    },
    async fetchResumeData() {
      try {
        this.loading = true;
        this.error = null;
        
        const data = await ApiService.fetchResumeData();
        
        // Set all data from API
        this.personalInfo = data.personal_info;
        this.contact = data.contact;
        this.visa = data.visa;
        this.skills = data.skills;
        this.skillTags = data.skill_tags;
        this.experiences = data.experiences;
        this.education = data.education;
        this.certifications = data.certifications;
        this.codingProfiles = data.coding_profiles;
        this.projects = data.projects || [];
        this.headlines = data.headlines;
        
        // Set personal info properties for template
        this.name = data.personal_info.name;
        this.title = data.personal_info.title;
        this.introText = data.personal_info.intro_text;
        
      } catch (error) {
        this.error = error.message;
        console.error('Failed to fetch resume data:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
/* Set base font size for normal text */
.container, .left-col, .right-col, .resume-section, .timeline-content, ul, li, .company, .inner-section {
  font-size: 14px;
}

.container {
  box-shadow: rgba(50, 50, 93, 0.25) 0px 13px 27px -5px, rgba(0, 0, 0, 0.3) 0px 8px 16px -8px;
  /* height: 297mm; */
  width: 100%;
  max-width: 210mm;
  box-sizing: border-box;
}
/* Search overlay styles */
.resume-search-bar {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  background: var(--background-color-right, #fff);
  padding: 12px 0 8px 0;
  display: flex;
  justify-content: center;
}
.resume-search-input {
  width: min(680px, 90%);
  font-size: 15px;
  padding: 8px 16px;
  border-radius: 9999px;
  border: 1px solid #ddd;
  outline: none;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.resume-search-dropdown {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  width: min(680px, 90%);
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
  margin-top: 2px;
  z-index: 100;
  list-style: none;
  padding: 0;
  max-height: 220px;
  overflow-y: auto;
}

.resume-search-suggestion {
  padding: 10px 18px;
  cursor: pointer;
  font-size: 15px;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f0f0;
}

.resume-search-suggestion:last-child {
  border-bottom: none;
}

.resume-search-suggestion:hover {
  background: #f2f2f2;
}

/* Selected Skills Display */
.selected-skills-container {
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
  position: sticky;
  top: 50px;
  z-index: 40;
}

.selected-skills-wrapper {
  max-width: min(680px, 90%);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.selected-skills-label {
  font-weight: 600;
  color: #666;
  font-size: 14px;
  white-space: nowrap;
}

.selected-skills-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1;
}

.selected-skill-tag {
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.remove-skill-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.remove-skill-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.clear-all-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.clear-all-btn:hover {
  background: #c82333;
}

.left-col {
  background-color: var(--background-color-left);
  color: var(--text-color-left);
  border-right: 1px solid var(--highlight-color-left);
  width: 30%;
  padding: 20px;
  box-sizing: border-box;
}

.right-col {
  background-color: var(--background-color-right);
  color: var(--text-color-right);
  width: 70%;
  padding: 20px;
  box-sizing: border-box;
}

.section-headline {
  font-size: 20px;
  font-weight: var(--headline-weight);
  margin-bottom: 15px;
  margin-top: 0;
}

.right-col .section-headline {
  color: var(--highlight-color-right);
}

.left-col .section-headline {
  border-bottom: 1px solid var(--highlight-color-left);
  padding-bottom: 5px;
  margin-right: -30px;
  padding-right: 10px;
  color: var(--highlight-color-left);
}

.resume-section {
  margin-bottom: 30px;
}

.personal-name {
  font-weight: 300;
  color: var(--highlight-color-right);
  font-size: 28px;
  border-bottom: 1px solid var(--highlight-color-right);
  margin: 0;
  margin-left: -30px;
  padding-left: 30px;
  padding-bottom: 15px;
}

.personal-title {
  border-bottom: 1px solid var(--highlight-color-right);
  margin: 0 0 20px -30px;
  padding: 15px 0 15px 30px;
  font-weight: 300;
  font-size: 20px;
}

#resume ul {
  padding-inline-start: 16px;
  margin-block-end: 0px;
  margin-block-start: 5px;
}

.inner-section {
  margin-bottom: 20px;
}

.company {
  font-size: 1.5rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  text-decoration: underline;
  margin-bottom: 10px;
}

.certification-title {
  font-weight: bold;
  display: flex;
  align-items: center;
  text-decoration: underline;
  margin-bottom: 5px;
}

.company img {
  display: inline-block;
  vertical-align: middle;
  margin-right: 16px;
  border: 2px dotted var(--highlight-color-right);
  border-radius: 50%;
}

.d-flex {
    display: flex;
}

.justify-content-between {
    justify-content: space-between;
}

.visa-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}
.visa-current {
  font-weight: bold;
}

.scrollable-section {
  max-height: 350px;
  overflow-y: auto;
  padding-right: 5px;
}

.position-block {
  margin-bottom: 8px;
}

/* Certifications bordered section */
.certifications-bordered-section {
  border: 1px solid var(--highlight-color-right);
  border-radius: 8px;
  padding: 0;
  margin-bottom: 30px;
}

.certifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #ddd;
  padding: 15px 20px;
  margin: 0;
  border-radius: 8px 8px 0 0;
}

.certifications-header .section-headline {
  margin: 0;
  color: #333;
}

.view-toggle-buttons {
  display: flex;
  gap: 4px;
}

.view-toggle-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #999;
  background: #fff;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #666;
}

.view-toggle-btn:hover {
  background: #f0f0f0;
  border-color: #666;
}

.view-toggle-btn.active {
  background: var(--highlight-color-right);
  border-color: var(--highlight-color-right);
  color: #fff;
}

.certifications-bordered-section .scrollable-section {
  padding: 0 20px 20px 20px;
}

/* Certification card styles */
.certification-card {
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 8px;
}

.certification-card:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Certification grid view styles */
.certification-grid-view {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 10px 0;
}

.certification-grid-item {
  aspect-ratio: 1.4;
  overflow: hidden;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.certification-grid-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.certification-grid-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  transition: opacity 0.2s ease;
}

.certification-grid-image:hover {
  opacity: 0.9;
}

/* Modal styles */
.cert-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.cert-modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 90%;
  overflow: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.cert-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  background: #f8f9fa;
  border-radius: 12px 12px 0 0;
}

.cert-modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.cert-modal-close {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.cert-modal-close:hover {
  background-color: #e9ecef;
  color: #333;
}

.cert-modal-body {
  padding: 24px;
  text-align: center;
}

.cert-modal-image {
  max-width: 95%;
  max-height: 55vh;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.cert-modal-fallback {
  padding: 40px 20px;
  color: #666;
}

.cert-modal-fallback p {
  margin-bottom: 16px;
  font-size: 16px;
}

.cert-modal-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #eee;
  text-align: center;
}

.cert-modal-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  padding: 10px 20px;
  border: 2px solid #007bff;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.cert-modal-link:hover {
  background-color: #007bff;
  color: white;
  text-decoration: none;
}

/* Loading and Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #dc3545;
  margin-bottom: 12px;
}

.retry-btn {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 16px;
  transition: background-color 0.2s ease;
}

.retry-btn:hover {
  background-color: #0056b3;
}

/* Projects Section */
.project-header {
  margin-bottom: 6px;
}

.project-header h5 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

/* Updated for flex layout */
.d-flex {
  display: flex;
}

.justify-content-between {
  justify-content: space-between;
}

.project-position {
  font-size: 14px;
  color: #666;
  font-style: italic;
  font-weight: 500;
}

.project-duration {
  font-size: 13px;
  color: #888;
  white-space: nowrap; /* Prevent duration from wrapping */
}

.project-description {
  margin: 8px 0;
  line-height: 1.4;
}

.project-bullets {
  margin: 8px 0;
  padding-left: 20px;
}

.project-bullets li {
  margin-bottom: 4px;
  line-height: 1.3;
}

.project-skills {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.skill-tag {
  background-color: #f0f0f0;
  color: #333;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .d-flex.justify-content-between {
    flex-direction: column;
    gap: 4px;
  }
  
  .project-position {
    font-size: 13px;
  }
  
  .project-duration {
    font-size: 12px;
    align-self: flex-end;
  }
}
</style>