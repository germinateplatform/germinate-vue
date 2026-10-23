<template>
  <div :class="['custom-page', 'passport-page', { 'is-popup': isPopup, 'is-new': isNew }]">
    <!-- Header -->
    <!-- Not for a new germplasm: there is nothing to show in it yet -->
    <section :class="['pp-card', 'pp-header', { 'pp-header-has-image': referenceImages.length > 0 }]" v-if="!isNew">
      <!-- Reference images of the accession, blurred behind the header. Several ones fade into each other. -->
      <div class="pp-header-backdrop" v-if="referenceImages.length > 0" aria-hidden="true">
        <div v-for="(image, index) in referenceImages"
             :key="'pp-header-image-' + image.imageId"
             :class="['pp-header-image', { active: index === referenceImageIndex }]"
             :style="{ backgroundImage: `url('${getReferenceImageSrc(image)}')` }" />
        <div class="pp-header-veil" />
      </div>

      <div class="pp-header-main">
        <div class="pp-header-crop">
          <!-- Germplasm group of the accession, with the icon of its flagship crop like on the home page -->
          <template v-if="cropGroup">
            <span :class="['pp-crop-icon', `cp-crop-${cropGroup.crop ? cropGroup.crop.key : 'other'}`]"><MdiIcon :path="cropGroup.crop ? cropGroup.crop.icon : icons.group" :size="20" /></span>
            <span class="pp-crop-name">{{ cropGroup.groupName }}</span>
          </template>
          <!-- In-situ when the accession has the attribute IN-SITU with value 1, ex-situ otherwise -->
          <span class="pp-status-badge" v-if="conservation">{{ conservation }}</span>
        </div>
        <!-- Accession number, with the accession name next to it (cut with "..." when too long) -->
        <h1 class="pp-title" v-if="accessionNumber">
          <span class="pp-title-main">{{ accessionNumber }}</span>
          <small class="pp-title-secondary" v-if="accessionName" :title="accessionName">{{ accessionName }}</small>
        </h1>
        <!-- Genus, species and species authority -->
        <div class="pp-taxonomy" v-if="taxonomy">{{ taxonomy }}</div>
      </div>

      <div class="pp-header-actions">
        <!-- Same as the checkbox on the original passport page: adds the accession to, or removes it from, the marked germplasm -->
        <button type="button"
                :class="['pp-action-button', { marked: isMarked }]"
                :aria-pressed="isMarked"
                :disabled="!germplasm"
                :title="$t('tooltipGermplasmMarkedItem')"
                @click="toggleMarked">
          <span class="pp-action-icon pp-action-mark"><MdiIcon :path="isMarked ? icons.checked : icons.unchecked" :size="22" /></span>
          {{ isMarked ? 'Unmark Germplasm' : 'Mark Germplasm' }}
        </button>
        <!-- Same as the original passport page: opens Humbug with this accession in a new window -->
        <a :href="barcodeUrl" target="_blank" rel="noopener noreferrer" class="pp-action-button" title="Generate barcode using Humbug">
          <span class="pp-action-icon pp-action-barcode"><MdiIcon :path="icons.barcode" :size="22" /></span>
          Generate Barcode
        </a>
        <!-- Passport Data Completeness Index, out of 10. Hidden when the PDCI calculation is turned off. -->
        <div class="pp-pdci" v-if="showPdci">
          <div class="pp-pdci-bar" role="progressbar" aria-valuemin="0" aria-valuemax="10" :aria-valuenow="pdci === null ? 0 : pdci" aria-label="PDCI">
            <span class="pp-pdci-fill" :style="{ width: `${pdciFillPercent}%` }" />
          </div>
          <span class="pp-pdci-text">PDCI: {{ pdciText }}</span>
          <!-- Same help as next to the PDCI title on the original passport page -->
          <button type="button" class="pp-info pp-info-button" @click="$refs.pdciModal.show()" :title="$t('pagePassportPdciTitle')" :aria-label="$t('pagePassportPdciTitle')">
            <MdiIcon :path="icons.info" :size="16" />
          </button>
          <b-modal :title="$t('pagePassportPdciTitle')" ok-only ref="pdciModal">
            <div v-html="$t('pagePassportPdciModal')" />
          </b-modal>
        </div>
      </div>
    </section>

    <!-- Tabs: Passport is the default one -->
    <b-tabs class="pp-tabs" nav-class="pp-tabs-nav" content-class="pp-tabs-content" v-model="tabIndex">
      <b-tab title="Passport" active>
        <div :class="['pp-tab-content', { 'pp-tab-content-new': isNew, 'pp-busy': isNew && savingGermplasm }]" :inert="isNew && savingGermplasm">
          <!-- Select on map: the location block unfolds over the whole row with a world map -->
          <transition name="pp-unfold" @after-enter="onExpandedMapShown">
            <section class="pp-card pp-panel pp-location-expanded" v-if="isSelectingOnMap" ref="expandedLocation">
              <div class="pp-panel-header pp-panel-header-plain">
                <div class="pp-panel-heading">
                  <h2 class="pp-panel-title">Location</h2>
                  <span class="pp-location-hint">Click on the map to place the new location, then confirm it in the marker.</span>
                </div>
                <button type="button" class="pp-small-button" @click="stopMapSelection">
                  <MdiIcon :path="icons.close" :size="16" /> {{ $t('buttonCancel') }}
                </button>
              </div>
              <!-- Typed coordinates place the pin once both are valid; a pin placed on the map fills them in -->
              <div class="pp-map-coordinates">
                <b-form-group label="Latitude" label-for="pp-map-latitude" class="pp-map-coordinate" :state="getCoordinateState('latitude')" :invalid-feedback="getCoordinateError('latitude')">
                  <b-form-input id="pp-map-latitude" size="sm" v-model="mapCoordinates.latitude" inputmode="decimal" placeholder="e.g. 51.8236" :state="getCoordinateState('latitude')" />
                </b-form-group>
                <b-form-group label="Longitude" label-for="pp-map-longitude" class="pp-map-coordinate" :state="getCoordinateState('longitude')" :invalid-feedback="getCoordinateError('longitude')">
                  <b-form-input id="pp-map-longitude" size="sm" v-model="mapCoordinates.longitude" inputmode="decimal" placeholder="e.g. 11.2878" :state="getCoordinateState('longitude')" />
                </b-form-group>
              </div>
              <div class="pp-map pp-map-large">
                <LocationMap :locations="location ? [location] : []"
                             baseLayer="osm"
                             selectionMode="point"
                             :isEditMode="true"
                             :openPopup="true"
                             :showLinks="false"
                             :initialZoom="2"
                             @selection-changed="onMapLocationSelected"
                             @point-placed="onMapPointPlaced"
                             @cancel-selection="stopMapSelection"
                             ref="expandedMap" />
              </div>
            </section>
          </transition>

          <div class="pp-main" v-if="mcpd">
            <!-- Overview: the MCPD fields of the original passport page -->
            <section :class="['pp-card', 'pp-panel', { 'pp-panel-lists': isEditing }]">
              <!-- The header holds two buttons (edit, collapse), so it is not a button itself. Only the chevron collapses it. -->
              <div class="pp-panel-header pp-panel-header-plain">
                <h2 class="pp-panel-title">{{ isNew ? 'MCPD' : 'Overview' }}</h2>
                <div class="pp-panel-actions">
                  <!-- Data curators edit the passport here. Keeps the focus in the field (mousedown) so a pending value isn't committed by the click itself. -->
                  <button type="button" class="pp-small-button pp-edit-button" v-if="isDataCurator && mcpd && !isNew"
                          :class="{ 'pp-edit-button-save': hasPendingChanges }"
                          :disabled="savingGermplasm || (hasPendingChanges && !editIsValid)"
                          @mousedown.prevent
                          @click.stop="onEditButtonClick">
                    <MdiIcon :path="icons.reload" :size="16" className="pp-spin" v-if="savingGermplasm" />
                    <MdiIcon :path="hasPendingChanges ? icons.save : icons.edit" :size="16" v-else />
                    {{ savingGermplasm ? (savePhase === 'validating' ? 'Validating ...' : 'Updating ...') : (hasPendingChanges ? 'Save changes' : 'Edit Passport') }}
                  </button>
                  <!-- Leaves the edit mode, asking first when something was changed -->
                  <button type="button" class="pp-small-button pp-edit-button pp-cancel-button" v-if="isEditing && !savingGermplasm && !isNew" @mousedown.prevent @click.stop="cancelEditing">
                    <MdiIcon :path="icons.cancel" :size="16" /> Cancel
                  </button>
                  <button type="button" class="pp-panel-toggle" :aria-expanded="open.overview" @click.stop="toggle('overview')" aria-label="Show or hide overview">
                    <span :class="['pp-panel-chevron', { closed: !open.overview }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
                  </button>
                </div>
              </div>
              <!-- Blocked while the changes are saved (the header stays usable) -->
              <div v-show="open.overview" :class="{ 'pp-busy': savingGermplasm }" :inert="savingGermplasm" :aria-busy="savingGermplasm ? 'true' : null">
                <!-- A new germplasm: first the conservation type, which decides the fields that follow -->
                <template v-if="isNew">
                  <div class="pp-field" v-for="field in newGermplasmFields" :key="'pp-new-field-' + field.key">
                    <div class="pp-field-name">
                      <div class="pp-field-code">
                        {{ field.code }}
                        <button type="button" class="pp-info pp-info-button" :aria-label="'About ' + field.code" v-b-popover.hover.focus.right="{ title: field.code, content: field.description }">
                          <MdiIcon :path="icons.info" :size="14" />
                        </button>
                      </div>
                      <div class="pp-field-label">{{ field.label }}</div>
                    </div>
                    <div :class="['pp-field-value', { italic: field.italic }]">
                      <!-- CONSERVATION: ex-situ or in-situ, like the filter of the germplasm list -->
                      <template v-if="field.key === 'conservation'">
                        <b-button-group size="sm" class="pp-conservation-buttons" aria-label="CONSERVATION: conservation type">
                          <b-button v-for="option in conservationOptions"
                                    :key="option"
                                    variant="outline-secondary"
                                    :pressed="newConservation === option"
                                    :class="{ selected: newConservation === option }"
                                    @click="chooseConservation(option)">
                            {{ option }}
                          </b-button>
                        </b-button-group>
                        <b-form-invalid-feedback :state="getNewFieldState('conservation')">{{ getNewFieldError('conservation') }}</b-form-invalid-feedback>
                      </template>
                      <!-- CROPSHIP: one of the germplasm groups of the database, with the icon of its crop -->
                      <div v-else @focusout="onNewCropshipFocusOut" @click="openSuggestionList($event, 'cropship')">
                        <VueTypeaheadBootstrap v-model="newCropship"
                                               id="edit-cropship"
                                               ref="editInput-cropship"
                                               size="sm"
                                               :data="newGroups"
                                               :serializer="group => group.groupName"
                                               :showOnFocus="true"
                                               :minMatchingChars="0"
                                               :maxMatches="Math.max(newGroups.length, 1)"
                                               :showAllResults="!!findNewGroup(newCropship)"
                                               :disableSort="true"
                                               :inputClass="getNewFieldState('cropship') === false ? 'is-invalid' : ''">
                          <template #prepend>
                            <span class="input-group-text pp-group-icon" :style="getGroupIconStyle(newCropship)"><MdiIcon :path="getGroupIcon(newCropship)" :size="16" /></span>
                          </template>
                          <template #suggestion="{ data }">
                            <span class="pp-group-option">
                              <span class="pp-group-icon" :style="getGroupIconStyle(data.groupName)"><MdiIcon :path="getGroupIcon(data.groupName)" :size="16" /></span>
                              <span>{{ data.groupName }}</span>
                            </span>
                          </template>
                          <template #append>
                            <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" aria-label="Clear CROPSHIP" @click="newCropship = ''; focusField('cropship')">
                              <MdiIcon :path="icons.broom" :size="16" />
                            </b-button>
                          </template>
                        </VueTypeaheadBootstrap>
                        <b-form-invalid-feedback :state="getNewFieldState('cropship')">{{ getNewFieldError('cropship') }}</b-form-invalid-feedback>
                      </div>
                    </div>
                  </div>
                </template>
                <div class="pp-field" v-for="field in (isNew ? newPassportFields : overviewFields)" :key="'pp-field-' + field.code">
                  <div class="pp-field-name">
                    <div class="pp-field-code">
                      {{ field.code }}
                      <!-- MCPD description of the field -->
                      <button type="button" class="pp-info pp-info-button" :aria-label="'About ' + field.code" v-b-popover.hover.focus.right="{ title: field.code, content: field.description }">
                        <MdiIcon :path="icons.info" :size="14" />
                      </button>
                    </div>
                    <div class="pp-field-label">{{ field.label }}</div>
                  </div>
                  <!-- While editing, the values that can't be changed (see LOCKED_WHILE_EDITING) are shown as disabled -->
                  <div :class="['pp-field-value', { italic: field.italic, 'pp-field-disabled': isLockedWhileEditing(field) }]"
                       :aria-disabled="isLockedWhileEditing(field) ? 'true' : null"
                       :title="isLockedWhileEditing(field) ? 'This field can\'t be changed' : null">
                    <!-- A new germplasm: ACCENUMB and GENUS (never editable otherwise). GENUS decides the values suggested in the other fields. -->
                    <!-- GENUS of a new germplasm (mandatory): the genera of the database, or a new one -->
                    <div v-if="isNew && field.key === 'genus'" @focusout="onNewGenusFocusOut" @click="openSuggestionList($event, 'genus')">
                      <VueTypeaheadBootstrap v-model="newGermplasm.genus"
                                             id="edit-genus"
                                             ref="editInput-genus"
                                             size="sm"
                                             :data="newAllValues.genus"
                                             :showOnFocus="true"
                                             :minMatchingChars="0"
                                             :maxMatches="50"
                                             :showAllResults="isListValue(newAllValues.genus, newGermplasm.genus)"
                                             :inputClass="getNewFieldState('genus') === false ? 'is-invalid' : ''"
                                             @hit="loadSuggestions()">
                        <template #append>
                          <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" aria-label="Clear GENUS" @click="newGermplasm.genus = ''; focusField('genus')">
                            <MdiIcon :path="icons.broom" :size="16" />
                          </b-button>
                        </template>
                      </VueTypeaheadBootstrap>
                      <b-form-invalid-feedback :state="getNewFieldState('genus')">{{ getNewFieldError('genus') }}</b-form-invalid-feedback>
                    </div>
                    <!-- ACCENUMB of a new germplasm (mandatory): no other germplasm of the database may have it -->
                    <div v-else-if="isNew && newGermplasm[field.key] !== undefined">
                      <b-input-group size="sm">
                        <b-form-input v-model="newGermplasm[field.key]"
                                      :ref="`editInput-${field.key}`"
                                      maxlength="255"
                                      :aria-label="field.code"
                                      :state="getNewFieldState(field.key)"
                                      @input="onNewFieldInput(field.key)"
                                      @blur="touchNewField(field.key)" />
                        <b-input-group-append>
                          <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="newGermplasm[field.key] = ''; onNewFieldInput(field.key); focusField(field.key)">
                            <MdiIcon :path="icons.broom" :size="16" />
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                      <b-form-invalid-feedback :state="getNewFieldState(field.key)">{{ getNewFieldError(field.key) }}</b-form-invalid-feedback>
                    </div>
                    <!-- Editable fields: a text field while editing -->
                    <template v-else-if="isEditing && field.editKey">
                      <!-- Country fields (ORIGCTY, NICODE): one of the countries of the database, searched by name or code. The 3-letter code is saved. -->
                      <div v-if="isCountryField(field.editKey)" @focusout="onSuggestionFocusOut($event, field.editKey)" @click="openSuggestionList($event, field.editKey)">
                        <VueTypeaheadBootstrap v-model="edit[field.editKey]"
                                               :id="`edit-${field.editKey}`"
                                               :ref="`editInput-${field.editKey}`"
                                               size="sm"
                                               :data="editCountries"
                                               :serializer="formatCountry"
                                               :showOnFocus="true"
                                               :minMatchingChars="0"
                                               :maxMatches="editCountries.length"
                                               :showAllResults="!!findCountry(edit[field.editKey])"
                                               :disableSort="true"
                                               :inputClass="getEditState(field.editKey) === false ? 'is-invalid' : ''"
                                               @hit="commitEdit(field.editKey)"
                                               @keyup="$event.key === 'Enter' && commitEdit(field.editKey)">
                          <template #suggestion="{ data }">
                            <span class="pp-country-option">
                              <span :class="`fi fi-${data.countryCode2.toLowerCase()}`" />
                              <span class="pp-country-name" :title="data.countryName">{{ data.countryName }}</span>
                              <span class="pp-country-code">{{ data.countryCode3 }}</span>
                            </span>
                          </template>
                          <template #append>
                            <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="clearField(field.editKey)">
                              <MdiIcon :path="icons.broom" :size="16" />
                            </b-button>
                          </template>
                        </VueTypeaheadBootstrap>
                      </div>
                      <!-- MLSSTAT: two joined buttons, 0 (No) and 1 (Yes), the chosen one highlighted. Any other current value is shown next to them until one is chosen. -->
                      <div v-else-if="field.editKey === 'mlsstat'" class="pp-switch-field">
                        <b-form-radio-group buttons
                                            size="sm"
                                            button-variant="outline-secondary"
                                            class="pp-segmented"
                                            :checked="edit.mlsstat"
                                            :options="mlsstatOptions"
                                            aria-label="MLSSTAT: in the Multilateral System"
                                            @change="setMlsstat" />
                        <small class="pp-field-empty" v-if="edit.mlsstat !== '0' && edit.mlsstat !== '1'">(current: {{ edit.mlsstat || 'no value' }})</small>
                      </div>
                      <!-- Fields with several codes (STORAGE, SITEPROT), shown as tags. A current value outside the list is shown as a red tag (it has to be removed to save).
                           Like an input group: "Add" (opens the codes above, as wide as the field), the tags (long names cut, full name on hover), the clear button -->
                      <div v-else-if="isMultiCodedField(field.editKey)" class="pp-tags-field" :ref="`tagsField-${field.editKey}`" @focusout="onTagsFocusOut" @keydown.esc="tagMenuOpen = null">
                        <div class="input-group input-group-sm">
                          <div class="input-group-prepend">
                            <button type="button"
                                    class="custom-select custom-select-sm pp-tags-add"
                                    :aria-expanded="tagMenuOpen === field.editKey ? 'true' : 'false'"
                                    aria-haspopup="listbox"
                                    :disabled="getTagOptions(field.editKey).length === 0"
                                    @click="tagMenuOpen = tagMenuOpen === field.editKey ? null : field.editKey">Add</button>
                          </div>
                          <div :class="['form-control', 'pp-tags', { 'is-invalid': getEditState(field.editKey) === false }]">
                            <b-form-tag v-for="tag in tagValues[field.editKey]"
                                        :key="tag"
                                        :variant="findCode(field.editKey, tag) ? 'success' : 'danger'"
                                        :title="findCode(field.editKey, tag) ? formatCode(findCode(field.editKey, tag)) : 'Not one of the MCPD codes'"
                                        class="pp-tag"
                                        @remove="removeTag(field.editKey, tag)">
                              {{ findCode(field.editKey, tag) ? formatCode(findCode(field.editKey, tag)) : tag }}
                            </b-form-tag>
                          </div>
                          <div class="input-group-append">
                            <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="clearField(field.editKey); commitEdit(field.editKey)">
                              <MdiIcon :path="icons.broom" :size="16" />
                            </b-button>
                          </div>
                        </div>
                        <div class="pp-tags-menu" role="listbox" :aria-label="`${field.code} codes`" v-if="tagMenuOpen === field.editKey && getTagOptions(field.editKey).length > 0">
                          <button type="button" class="pp-tags-option" role="option" v-for="item in getTagOptions(field.editKey)" :key="item.code" @click="addTag(field.editKey, item)">
                            <span class="pp-code-badge">{{ item.code }}</span> {{ item.name }}
                          </button>
                        </div>
                      </div>
                      <!-- Coded fields (SAMPSTAT, COLLSRC): one of the MCPD codes, searched by code or name. A current value outside the list is shown as it is. -->
                      <div v-else-if="isCodedField(field.editKey)" @focusout="onSuggestionFocusOut($event, field.editKey)" @click="openSuggestionList($event, field.editKey)">
                        <VueTypeaheadBootstrap v-model="edit[field.editKey]"
                                               :id="`edit-${field.editKey}`"
                                               :ref="`editInput-${field.editKey}`"
                                               size="sm"
                                               :data="codeDomains[field.editKey]"
                                               :serializer="formatCode"
                                               :showOnFocus="true"
                                               :minMatchingChars="0"
                                               :maxMatches="codeDomains[field.editKey].length"
                                               :showAllResults="isCodeSelected(field.editKey)"
                                               :disableSort="true"
                                               :inputClass="getEditState(field.editKey) === false ? 'is-invalid' : ''"
                                               @hit="commitEdit(field.editKey)"
                                               @keyup="$event.key === 'Enter' && commitEdit(field.editKey)">
                          <template #suggestion="{ data }">
                            <span class="pp-code-badge">{{ data.code }}</span> {{ data.name }}
                          </template>
                          <template #append>
                            <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="clearField(field.editKey)">
                              <MdiIcon :path="icons.broom" :size="16" />
                            </b-button>
                          </template>
                        </VueTypeaheadBootstrap>
                      </div>
                      <!-- SUBTAXA: abbreviation from the MCPD list, then the name (names of the same genus and abbreviation suggested) -->
                      <div v-else-if="field.editKey === 'subtaxa'" @focusout="onSuggestionFocusOut($event, 'subtaxa')" @click="openSuggestionList($event, 'subtaxa')">
                        <VueTypeaheadBootstrap v-model="subtaxaName"
                                               id="edit-subtaxa"
                                               ref="editInput-subtaxa"
                                               size="sm"
                                               :data="subtaxaNameSuggestions"
                                               :showOnFocus="true"
                                               :minMatchingChars="0"
                                               :maxMatches="50"
                                               :showAllResults="isListValue(subtaxaNameSuggestions, subtaxaName)"
                                               :inputClass="getEditState('subtaxa') === false ? 'is-invalid' : ''"
                                               @hit="commitEdit('subtaxa')"
                                               @keyup="$event.key === 'Enter' && commitEdit('subtaxa')">
                          <template #prepend>
                            <b-form-select v-model="subtaxaRank"
                                           :options="subtaxaRankOptions"
                                           size="sm"
                                           class="pp-subtaxa-rank"
                                           :state="getEditState('subtaxa')"
                                           aria-label="Subtaxon abbreviation"
                                           @change="commitEdit('subtaxa')" />
                          </template>
                          <template #append>
                            <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" aria-label="Clear SUBTAXA" @click="clearField('subtaxa')">
                              <MdiIcon :path="icons.broom" :size="16" />
                            </b-button>
                          </template>
                        </VueTypeaheadBootstrap>
                      </div>
                      <!-- Values already in the database, filtered while typing. A value typed that isn't in the list is saved as it is. -->
                      <div v-else-if="hasSuggestions(field.editKey)" @focusout="onSuggestionFocusOut($event, field.editKey)" @click="openSuggestionList($event, field.editKey)">
                        <VueTypeaheadBootstrap v-model="edit[field.editKey]"
                                               :id="`edit-${field.editKey}`"
                                               :ref="`editInput-${field.editKey}`"
                                               size="sm"
                                               :data="editSuggestions[field.editKey]"
                                               :showOnFocus="true"
                                               :minMatchingChars="0"
                                               :maxMatches="50"
                                               :showAllResults="isListValue(editSuggestions[field.editKey], edit[field.editKey])"
                                               :inputClass="getEditState(field.editKey) === false ? 'is-invalid' : ''"
                                               @hit="commitEdit(field.editKey)"
                                               @keyup="$event.key === 'Enter' && commitEdit(field.editKey)">
                          <template #append>
                            <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="clearField(field.editKey)">
                              <MdiIcon :path="icons.broom" :size="16" />
                            </b-button>
                          </template>
                        </VueTypeaheadBootstrap>
                      </div>
                      <b-input-group size="sm" v-else>
                        <b-form-input v-model="edit[field.editKey]"
                                      :ref="`editInput-${field.editKey}`"
                                      :maxlength="editableFields[field.editKey].maxLength"
                                      :state="getEditState(field.editKey)"
                                      :aria-label="field.code"
                                      @blur="commitEdit(field.editKey)"
                                      @keydown.enter.prevent="commitEdit(field.editKey)" />
                        <b-input-group-append>
                          <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="clearField(field.editKey)">
                            <MdiIcon :path="icons.broom" :size="16" />
                          </b-button>
                        </b-input-group-append>
                      </b-input-group>
                      <b-form-invalid-feedback :state="getEditState(field.editKey)">{{ getEditError(field.editKey) }}</b-form-invalid-feedback>
                    </template>
                    <template v-else-if="field.value">
                      <!-- Several codes: one per line -->
                      <template v-if="field.lines && field.lines.length > 1">
                        <div v-for="(line, lineIndex) in field.lines" :key="`${field.code}-line-${lineIndex}`">{{ line }}</div>
                      </template>
                      <template v-else>
                        <span :class="`fi fi-${field.flag}`" v-if="field.flag" /> {{ field.value }}<template v-if="field.iso3"> ({{ field.iso3 }})</template>
                      </template>
                      <!-- The PUID is a DOI: open it on doi.org in a new window -->
                      <a v-if="field.link" :href="field.link" target="_blank" rel="noopener noreferrer" class="pp-field-link" :title="field.link"><MdiIcon :path="icons.openInNew" :size="16" /></a>
                    </template>
                    <span class="pp-field-empty" v-else>—</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- The Overview fields are MCPD descriptors -->
            <!-- Descriptor standard the data follows: CWRI for in-situ germplasm, MCPD otherwise. Shown once the in-situ attribute is known. -->
            <p class="pp-standard-note" v-if="conservation">
              <MdiIcon :path="icons.standard" :size="18" />
              <template v-if="conservation === 'In-situ'">
                <span>{{ $t('pagePassportCwriStandardNote') }}</span>
                <a :href="CWRI_DESCRIPTORS_URL" target="_blank" rel="noopener noreferrer" class="pp-standard-link" :title="CWRI_DESCRIPTORS_URL" :aria-label="CWRI_DESCRIPTORS_URL">
                  <MdiIcon :path="icons.openInNew" :size="16" />
                </a>
              </template>
              <span v-else>{{ $t('pagePassportMcpdStandardNote') }}</span>
            </p>
          </div>

          <div class="pp-side">
            <!-- Location: same map as the original passport page. Shown when the accession has coordinates, and to data
                 curators so they can set one. While selecting on the map it moves to the full-width block above. -->
            <section class="pp-card pp-panel" v-if="(location || isDataCurator) && !isSelectingOnMap">
              <button type="button" class="pp-panel-header" :aria-expanded="open.location" @click="toggle('location')">
                <h2 class="pp-panel-title">Location</h2>
                <span :class="['pp-panel-chevron', { closed: !open.location }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
              </button>
              <div v-show="open.location">
                <div class="pp-map">
                  <!-- Rebuilt whenever the location arrives or changes, so it always opens at the normal zoom on the location -->
                  <LocationMap :key="locationMapKey" :locations="location ? [location] : []" baseLayer="osm" :openPopup="false" :showLinks="false" :initialZoom="location ? 6 : 2" ref="map" />
                </div>

                <!-- A new germplasm: the location chosen, linked once the germplasm is created -->
                <div class="pp-new-location" v-if="isNew && newLocation">
                  <MdiIcon :path="icons.mapMarker" :size="16" />
                  <span class="pp-new-location-text" :title="getNewLocationText()">{{ getNewLocationText() }}</span>
                  <button type="button" class="pp-small-button pp-new-location-clear" title="Remove the location" aria-label="Remove the location" @click="newLocation = null">
                    <MdiIcon :path="icons.broom" :size="16" />
                  </button>
                </div>

                <!-- Same choices as on the original passport page -->
                <div class="pp-location-change" v-if="isDataCurator">
                  <div class="pp-location-change-title">{{ $t('modalTitleSelectGermplasmLocation') }}</div>
                  <div class="pp-location-change-actions">
                    <button type="button" class="pp-small-button" @click="$refs.locationSelectionModal.show()">
                      <MdiIcon :path="icons.table" :size="16" /> {{ $t('modalButtonSelectGermplasmLocationSelectFromTable') }}
                    </button>
                    <button type="button" class="pp-small-button" @click="startMapSelection">
                      <MdiIcon :path="icons.mapMarker" :size="16" /> {{ $t('modalButtonSelectGermplasmLocationSelectOnMap') }}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- Datasets: same data as the datasets table of the original passport page.
                 Only shown when there are any, or to data curators so they can add one. -->
            <section class="pp-card pp-panel" v-if="(datasetTotal > 0 || isDataCurator) && !isNew">
              <!-- The header holds two buttons (add, collapse), so it is not a button itself -->
              <div class="pp-panel-header" @click="toggle('datasets')">
                <div class="pp-panel-heading">
                  <h2 class="pp-panel-title">Datasets</h2>
                  <!-- Same as "Add dataset" in the datasets table of the original passport page -->
                  <button type="button" class="pp-panel-add" v-if="isDataCurator" @click.stop="addDataset" :title="$t('buttonAddDataset')" :aria-label="$t('buttonAddDataset')">
                    <MdiIcon :path="icons.plus" :size="18" />
                  </button>
                </div>
                <button type="button" class="pp-panel-toggle" :aria-expanded="open.datasets" @click.stop="toggle('datasets')" aria-label="Show or hide datasets">
                  <span :class="['pp-panel-chevron', { closed: !open.datasets }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
                </button>
              </div>
              <div v-show="open.datasets">
                <div class="pp-item pp-item-empty" v-if="datasetTotal === 0">No datasets yet</div>
                <!-- The whole row is the link, following the same rules as the dataset name in the original table -->
                <component v-for="dataset in datasets"
                           :key="'pp-dataset-' + dataset.datasetId"
                           :is="getDatasetLink(dataset).tag"
                           v-bind="getDatasetLink(dataset).attributes"
                           :class="['pp-item', { 'pp-item-link': getDatasetLink(dataset).tag !== 'div' }]">
                  <span class="pp-item-icon" :style="getDatasetTypeStyle(dataset)"><MdiIcon :path="getDatasetType(dataset).path" :size="16" /></span>
                  <div class="pp-item-body">
                    <div class="pp-item-title" :title="dataset.datasetName">{{ dataset.datasetName }}</div>
                    <div class="pp-item-subtitle">{{ getDatasetType(dataset).text() }}</div>
                  </div>
                  <span class="pp-item-external" v-if="getDatasetLink(dataset).tag === 'a'"><MdiIcon :path="icons.openInNew" :size="16" /></span>
                </component>

                <DatasetEditModal v-if="isDataCurator" :dataset="null" @changed="loadDatasets(datasetPage)" ref="datasetEditModal" />

                <!-- More than 4 datasets -->
                <div class="pp-pager" v-if="datasetPageCount > 1">
                  <button type="button" class="pp-pager-button" :disabled="datasetPage <= 1" @click="loadDatasets(datasetPage - 1)" aria-label="Previous datasets">
                    <MdiIcon :path="icons.chevronLeft" :size="20" />
                  </button>
                  <span class="pp-pager-text">{{ datasetPage }} / {{ datasetPageCount }}</span>
                  <button type="button" class="pp-pager-button" :disabled="datasetPage >= datasetPageCount" @click="loadDatasets(datasetPage + 1)" aria-label="Next datasets">
                    <MdiIcon :path="icons.chevronRight" :size="20" />
                  </button>
                </div>
              </div>
            </section>

            <!-- Institutions: same data as the institutions table of the original passport page, only shown when there are any -->
            <!-- Also shown to data curators when there is an institution to add -->
            <section class="pp-card pp-panel" v-if="institutions.length > 0 || (isDataCurator && missingInstitutionTypes.length > 0)">
              <!-- The header holds two buttons (edit, collapse), so it is not a button itself. Only the chevron collapses it. -->
              <div class="pp-panel-header pp-panel-header-plain">
                <div class="pp-panel-heading">
                  <h2 class="pp-panel-title">Institutions</h2>
                  <!-- Data curators edit the MCPD institutions of ex-situ germplasm (preview, nothing is saved yet).
                       With changes it becomes "save", with "cancel" next to it. -->
                  <!-- Only when there is something to edit: an MCPD institution type the germplasm has none of -->
                  <!-- A new germplasm: the maintenance institution, and on demand the other types (as when editing) -->
                  <button type="button" class="pp-panel-add" v-if="isNew"
                          :class="{ active: newOtherInstitutions }"
                          @click.stop="toggleNewOtherInstitutions" title="Add other institutions" aria-label="Add other institutions" :aria-pressed="newOtherInstitutions ? 'true' : 'false'">
                    <MdiIcon :path="icons.edit" :size="18" />
                  </button>
                  <!-- A new germplasm is always being filled in: no edit, save or cancel here -->
                  <template v-if="isDataCurator && !isNew && (isEditingInstitutions || missingInstitutionTypes.length > 0)">
                    <button type="button" class="pp-panel-add" v-if="!hasInstitutionChanges"
                            :class="{ active: isEditingInstitutions }"
                            @click.stop="toggleInstitutionEditing" title="Edit institutions" aria-label="Edit institutions" :aria-pressed="isEditingInstitutions ? 'true' : 'false'">
                      <MdiIcon :path="icons.edit" :size="18" />
                    </button>
                    <template v-else>
                      <button type="button" class="pp-panel-add" :disabled="!institutionEditIsValid || savingInstitutions"
                              @click.stop="saveInstitutionChanges"
                              :title="savingInstitutions ? (institutionSavePhase === 'validating' ? 'Validating ...' : 'Updating ...') : 'Save changes'"
                              aria-label="Save the changes to the institutions">
                        <MdiIcon :path="savingInstitutions ? icons.reload : icons.save" :size="18" :className="savingInstitutions ? 'pp-spin' : ''" />
                      </button>
                      <button type="button" class="pp-panel-add pp-panel-cancel" v-if="!savingInstitutions"
                              @click.stop="cancelInstitutionEditing" title="Cancel" aria-label="Cancel the changes to the institutions">
                        <MdiIcon :path="icons.cancel" :size="18" />
                      </button>
                    </template>
                  </template>
                </div>
                <button type="button" class="pp-panel-toggle" :aria-expanded="open.institutions" @click.stop="toggle('institutions')" aria-label="Show or hide institutions">
                  <span :class="['pp-panel-chevron', { closed: !open.institutions }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
                </button>
              </div>
              <!-- Blocked while the changes are saved (the header stays usable) -->
              <div v-show="open.institutions" :class="{ 'pp-busy': savingInstitutions }" :inert="savingInstitutions" :aria-busy="savingInstitutions ? 'true' : null">
                <!-- The whole row opens the FAO WIEWS page of the institution code in a new window, like the code in the original table.
                     While editing: no links, all institutions on one page, the institutions already linked disabled (the import can only
                     add institutions, it can't change or remove one). -->
                <component v-for="(institution, index) in institutions"
                           :key="'pp-institution-' + institution.institutionId + '-' + institution.institutionType + '-' + index"
                           :is="institution.institutionCode && !isEditingInstitutions ? 'a' : 'div'"
                           v-bind="institution.institutionCode && !isEditingInstitutions ? { href: getWiewsOrganisationUrl(institution.institutionCode), target: '_blank', rel: 'noopener noreferrer' } : {}"
                           :aria-disabled="isEditingInstitutions ? 'true' : null"
                           :title="isEditingInstitutions ? 'An institution already linked to the germplasm can\'t be changed' : null"
                           :class="['pp-item', 'pp-institution', { 'pp-item-link': !!institution.institutionCode && !isEditingInstitutions, 'pp-institution-disabled': isEditingInstitutions }]">
                  <span class="pp-item-icon" :style="getInstitutionTypeStyle(institution)"><MdiIcon :path="getInstitutionType(institution).path" :size="16" /></span>
                  <div class="pp-item-body">
                    <div class="pp-institution-head">
                      <strong class="pp-institution-code">{{ institution.institutionCode || 'N/A' }}</strong>
                      <span class="pp-item-subtitle pp-institution-type">{{ getInstitutionType(institution).text() }}</span>
                    </div>
                    <div class="pp-item-title pp-institution-name" :title="getInstitutionName(institution)">{{ getInstitutionName(institution) }}</div>
                  </div>
                </component>

                <!-- While editing: the MCPD institution types the germplasm has none of, with a field for the institute code -->
                <template v-if="isEditingInstitutions">
                  <div class="pp-item pp-institution pp-institution-new" v-for="entry in missingInstitutionTypes" :key="'pp-institution-new-' + entry.type">
                    <span class="pp-item-icon" :style="getInstitutionTypeStyle({ institutionType: entry.type })"><MdiIcon :path="getInstitutionType({ institutionType: entry.type }).path" :size="16" /></span>
                    <div class="pp-item-body">
                      <div class="pp-institution-head">
                        <div class="pp-institution-input">
                          <b-form-input size="sm"
                                        :value="institutionEdit[`new-${entry.type}`]"
                                        maxlength="6"
                                        :state="getInstitutionCodeState(`new-${entry.type}`)"
                                        :aria-label="`${getInstitutionType({ institutionType: entry.type }).text()}: institute code (3-letter ISO country code + 3 digits)`"
                                        @input="setInstitutionCode(`new-${entry.type}`, $event)"
                                        @blur="touchInstitutionCode(`new-${entry.type}`)" />
                          <b-form-invalid-feedback :state="getInstitutionCodeState(`new-${entry.type}`)">{{ getInstitutionCodeError(`new-${entry.type}`) }}</b-form-invalid-feedback>
                        </div>
                        <span class="pp-item-subtitle pp-institution-type">{{ getInstitutionType({ institutionType: entry.type }).text() }}</span>
                      </div>
                      <!-- Name and address from FAO WIEWS once a complete code is found -->
                      <InstitutionLookupResult v-if="institutionLookup[`new-${entry.type}`]" :lookup="institutionLookup[`new-${entry.type}`]" />
                    </div>
                  </div>
                </template>

              </div>
            </section>

            <!-- Publications: same data as the publications of the original passport page.
                 Only shown when there are any, or to data curators so they can add one. -->
            <section class="pp-card pp-panel" v-if="(publications.length > 0 || isDataCurator) && !isNew">
              <div class="pp-panel-header" @click="toggle('publications')">
                <div class="pp-panel-heading">
                  <h2 class="pp-panel-title">Publications</h2>
                  <!-- Same as "Add publication" on the original passport page: added by DOI and referenced to this accession -->
                  <button type="button" class="pp-panel-add" v-if="isDataCurator" @click.stop="addPublication" :title="$t('buttonAddPublication')" :aria-label="$t('buttonAddPublication')">
                    <MdiIcon :path="icons.plus" :size="18" />
                  </button>
                </div>
                <button type="button" class="pp-panel-toggle" :aria-expanded="open.publications" @click.stop="toggle('publications')" aria-label="Show or hide publications">
                  <span :class="['pp-panel-chevron', { closed: !open.publications }]"><MdiIcon :path="icons.chevronUp" :size="22" /></span>
                </button>
              </div>
              <div v-show="open.publications">
                <div class="pp-item pp-item-empty" v-if="publications.length === 0">No publications yet</div>

                <!-- The whole row opens the publication ("Read more" on the original page) in a new window.
                     The link is stretched over the row so the delete button can sit on top of it. -->
                <div v-for="publication in publicationsOnPage"
                     :key="'pp-publication-' + publication.id"
                     :class="['pp-item', 'pp-publication', { 'pp-item-link': !!publication.url }]">
                  <span class="pp-item-icon pp-item-icon-neutral"><MdiIcon :path="icons.publication" :size="16" /></span>
                  <div class="pp-item-body">
                    <a v-if="publication.url" :href="publication.url" target="_blank" rel="noopener noreferrer" class="pp-item-title pp-stretched-link" :title="publication.title">{{ publication.title }}</a>
                    <div v-else class="pp-item-title" :title="publication.title">{{ publication.title }}</div>
                    <div class="pp-item-subtitle pp-publication-meta" v-if="getPublicationMeta(publication)" :title="getPublicationMeta(publication)">{{ getPublicationMeta(publication) }}</div>
                    <!-- Same as "Delete" on the publication cards of the original page: removes the link to this accession only -->
                    <b-button v-if="isDataCurator" variant="link" class="pp-publication-delete text-danger" @click="deletePublicationReference(publication)">{{ $t('buttonDelete') }}</b-button>
                  </div>
                </div>

                <!-- More than 4 publications -->
                <div class="pp-pager" v-if="publicationPageCount > 1">
                  <button type="button" class="pp-pager-button" :disabled="publicationPage <= 1" @click="publicationPage--" aria-label="Previous publications">
                    <MdiIcon :path="icons.chevronLeft" :size="20" />
                  </button>
                  <span class="pp-pager-text">{{ publicationPage }} / {{ publicationPageCount }}</span>
                  <button type="button" class="pp-pager-button" :disabled="publicationPage >= publicationPageCount" @click="publicationPage++" aria-label="Next publications">
                    <MdiIcon :path="icons.chevronRight" :size="20" />
                  </button>
                </div>

                <AddPublicationModal v-if="isDataCurator && germplasm" referenceType="germplasm" :referencingId="germplasm.germplasmId" @publication-added="onPublicationAdded" ref="addPublicationModal" />
              </div>
            </section>

            <!-- Recently viewed germplasm, the same list as "Recently viewed items" on the germplasm page -->
            <!-- Not in the preview of a table: it is for moving between passport pages -->
            <RecentlyViewedPanel :currentId="germplasm ? germplasm.germplasmId : null" v-if="!isPopup && !isNew" />
          </div>
        </div>
      </b-tab>

      <!-- Metadata: the additional attributes of the germplasm, in the style of the Overview. Only when there are any. -->
      <!-- A new germplasm: once its mandatory fields are valid -->
      <b-tab title="Metadata" lazy v-if="isNew ? newMandatoryFilled : (metadataFields.length > 0 || (isDataCurator && germplasm))">
        <div class="pp-tab-panel">
          <section :class="['pp-card', 'pp-panel', { 'pp-panel-lists': isNew || isEditingMetadata || addingMetadata }]">
            <div class="pp-panel-header pp-panel-header-plain">
              <h2 class="pp-panel-title">{{ $t('pagePassportAttributeTitle') }}</h2>
              <!-- Data curators edit the values here, like Edit Passport in the Overview -->
              <!-- A new germplasm: only [+], the values are saved with "Save Germplasm" -->
              <div class="pp-panel-actions" v-if="isDataCurator && (germplasm || isNew)">
                <!-- Adds a row for a new metadata (name and value) each time -->
                <button type="button" class="pp-panel-add" v-if="!isEditingMetadata" :disabled="savingMetadata" @click.stop="addMetadataRow" title="Add metadata" aria-label="Add metadata">
                  <MdiIcon :path="icons.plus" :size="18" />
                </button>
                <!-- With new rows: "Save new" once every row is complete -->
                <button type="button" class="pp-small-button pp-edit-button pp-edit-button-save" v-if="!isNew && addingMetadata && canSaveNewMetadata"
                        :disabled="savingMetadata"
                        @mousedown.prevent
                        @click.stop="saveNewMetadata">
                  <MdiIcon :path="icons.reload" :size="16" className="pp-spin" v-if="savingMetadata" />
                  <MdiIcon :path="icons.save" :size="16" v-else />
                  {{ savingMetadata ? (metadataSavePhase === 'validating' ? 'Validating ...' : 'Updating ...') : 'Save new' }}
                </button>
                <!-- Not while new rows are on the block -->
                <button type="button" class="pp-small-button pp-edit-button"
                        v-if="!isNew && (hasEditableMetadata || isEditingMetadata) && (!addingMetadata || !savingMetadata)"
                        :class="{ 'pp-edit-button-save': hasMetadataChanges }"
                        :disabled="savingMetadata || addingMetadata || (hasMetadataChanges && !metadataIsValid)"
                        @mousedown.prevent
                        @click.stop="onMetadataButtonClick">
                  <MdiIcon :path="icons.reload" :size="16" className="pp-spin" v-if="savingMetadata" />
                  <MdiIcon :path="hasMetadataChanges ? icons.save : icons.edit" :size="16" v-else />
                  {{ savingMetadata ? (metadataSavePhase === 'validating' ? 'Validating ...' : 'Updating ...') : (hasMetadataChanges ? 'Save changes' : 'Edit Metadata') }}
                </button>
                <button type="button" class="pp-small-button pp-edit-button pp-cancel-button" v-if="!isNew && (isEditingMetadata || addingMetadata) && !savingMetadata" @mousedown.prevent @click.stop="cancelMetadataEditing">
                  <MdiIcon :path="icons.cancel" :size="16" /> Cancel
                </button>
              </div>
            </div>
            <!-- Blocked while the changes are saved -->
            <div :class="{ 'pp-busy': savingMetadata }" :inert="savingMetadata" :aria-busy="savingMetadata ? 'true' : null">
            <!-- A new germplasm: the predefined metadata of its conservation type, to fill in -->
            <!-- Adding: also the predefined metadata the germplasm doesn't have yet -->
            <div class="pp-field" v-for="field in (isNew ? newMetadataFields : metadataFields.concat(addingMetadata ? suggestedMetadataFields : []))" :key="'pp-metadata-' + field.code">
              <div class="pp-field-name">
                <div class="pp-field-code">
                  {{ field.acronym || field.code }}
                  <!-- Only attributes with a known description get the help popover -->
                  <button type="button" class="pp-info pp-info-button" v-if="field.description" :aria-label="'About ' + field.code" v-b-popover.hover.focus.right="{ title: field.code, content: field.description }">
                    <MdiIcon :path="icons.info" :size="14" />
                  </button>
                </div>
                <div class="pp-field-label">{{ field.label }}</div>
              </div>
              <!-- While editing, an attribute with several values can't be changed (the import changes one value per name) -->
              <div :class="['pp-field-value', { 'pp-field-disabled': isEditingMetadata && !metadataEntries[field.code] }]"
                   :aria-disabled="isEditingMetadata && !metadataEntries[field.code] ? 'true' : null"
                   :title="isEditingMetadata && !metadataEntries[field.code] ? 'An attribute with several values can\'t be changed' : null">
                <template v-if="isNew || field.suggested || (isEditingMetadata && metadataEntries[field.code])">
                  <!-- NICODE: one of the countries of the database, the 3-letter code is saved -->
                  <div v-if="getMetadataType(field.code) === 'country'"
                       :class="['pp-country-field', { 'has-country': metadataFocus !== field.code && !!findCountry(metadataEdit[field.code]) }]"
                       @focusin="metadataFocus = field.code"
                       @focusout="onMetadataFocusOut($event, field.code)"
                       @click="openSuggestionList($event, `meta-${field.code}`)">
                    <span class="pp-country-selected" v-if="metadataFocus !== field.code && findCountry(metadataEdit[field.code])" aria-hidden="true">
                      <span :class="`fi fi-${findCountry(metadataEdit[field.code]).countryCode2.toLowerCase()}`" />
                      <span class="pp-country-name">{{ findCountry(metadataEdit[field.code]).countryName }}</span>
                      <span class="pp-country-code">{{ findCountry(metadataEdit[field.code]).countryCode3 }}</span>
                    </span>
                    <VueTypeaheadBootstrap v-model="metadataEdit[field.code]"
                                           :id="`edit-meta-${field.code}`"
                                           :ref="`editInput-meta-${field.code}`"
                                           size="sm"
                                           :data="editCountries"
                                           :serializer="formatCountry"
                                           :showOnFocus="true"
                                           :minMatchingChars="0"
                                           :maxMatches="Math.max(editCountries.length, 1)"
                                           :showAllResults="!!findCountry(metadataEdit[field.code])"
                                           :disableSort="true"
                                           :inputClass="getMetadataState(field.code) === false ? 'is-invalid' : ''"
                                           @hit="touchMetadata(field.code)">
                      <template #suggestion="{ data }">
                        <span class="pp-country-option">
                          <span :class="`fi fi-${data.countryCode2.toLowerCase()}`" />
                          <span class="pp-country-name" :title="data.countryName">{{ data.countryName }}</span>
                          <span class="pp-country-code">{{ data.countryCode3 }}</span>
                        </span>
                      </template>
                      <template #append>
                        <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="clearMetadata(field.code)">
                          <MdiIcon :path="icons.broom" :size="16" />
                        </b-button>
                        <!-- Predefined metadata to add: not added (the row goes) -->
                        <b-button variant="outline-secondary" class="pp-clear-button" v-if="isNew || field.suggested" title="Don't add this metadata" :aria-label="`Don't add ${field.code}`" @click="dismissMetadata(field.code)">
                          <MdiIcon :path="icons.close" :size="16" />
                        </b-button>
                      </template>
                    </VueTypeaheadBootstrap>
                  </div>
                  <!-- AEGISSTAT, HISTORIC: 0 (No) or 1 (Yes), like MLSSTAT -->
                  <div v-else-if="getMetadataType(field.code) === 'yesno'" class="pp-switch-field">
                    <b-form-radio-group buttons
                                        size="sm"
                                        button-variant="outline-secondary"
                                        class="pp-segmented"
                                        :checked="metadataEdit[field.code]"
                                        :options="mlsstatOptions"
                                        :aria-label="field.code"
                                        @change="setMetadataValue(field.code, $event)" />
                    <b-button variant="outline-secondary" size="sm" class="pp-clear-button pp-dismiss-button" v-if="isNew || field.suggested" title="Don't add this metadata" :aria-label="`Don't add ${field.code}`" @click="dismissMetadata(field.code)">
                      <MdiIcon :path="icons.close" :size="16" />
                    </b-button>
                    <small class="pp-field-empty" v-if="!isNew && !field.suggested && metadataEdit[field.code] !== '0' && metadataEdit[field.code] !== '1'">(current: {{ metadataEdit[field.code] || 'no value' }})</small>
                  </div>
                  <!-- ACCEURL: a URL (no spaces); any other attribute: text -->
                  <b-input-group size="sm" v-else>
                    <b-form-input :value="metadataEdit[field.code]"
                                  :type="getMetadataType(field.code) === 'url' ? 'url' : 'text'"
                                  :placeholder="getMetadataType(field.code) === 'url' ? 'https://' : null"
                                  :ref="`editInput-meta-${field.code}`"
                                  :state="getMetadataState(field.code)"
                                  :aria-label="field.code"
                                  @input="onMetadataInput(field.code, $event)"
                                  @blur="touchMetadata(field.code)" />
                    <b-input-group-append>
                      <b-button variant="outline-secondary" class="pp-clear-button" title="Clear" :aria-label="`Clear ${field.code}`" @click="clearMetadata(field.code)">
                        <MdiIcon :path="icons.broom" :size="16" />
                      </b-button>
                      <!-- Predefined metadata to add: not added (the row goes) -->
                      <b-button variant="outline-secondary" class="pp-clear-button" v-if="isNew || field.suggested" title="Don't add this metadata" :aria-label="`Don't add ${field.code}`" @click="dismissMetadata(field.code)">
                        <MdiIcon :path="icons.close" :size="16" />
                      </b-button>
                    </b-input-group-append>
                  </b-input-group>
                  <b-form-invalid-feedback :state="getMetadataState(field.code)">{{ getMetadataError(field.code) }}</b-form-invalid-feedback>
                </template>
                <template v-else>
                  <!-- Several values (separated by ";") are listed one below the other. URLs are links (cut with "..." when long). -->
                  <div class="pp-field-line" v-for="(line, index) in field.lines" :key="'pp-metadata-' + field.code + '-' + index">
                    <a v-if="line.url" :href="line.url" target="_blank" rel="noopener noreferrer" class="pp-field-url" :title="line.url">{{ line.text }}</a>
                    <template v-else-if="line.flag || line.iso3"><span :class="`fi fi-${line.flag}`" v-if="line.flag" /> {{ line.text }}<template v-if="line.iso3"> ({{ line.iso3 }})</template></template>
                    <template v-else>{{ line.text }}</template>
                  </div>
                </template>
              </div>
            </div>
            <!-- New metadata: its name (also its label; the acronym is made from it once it is added) and its value, both mandatory -->
            <div class="pp-field pp-metadata-new" v-for="(row, index) in newMetadataRows" :key="'pp-metadata-new-' + row.id">
              <div class="pp-field-name">
                <div class="pp-field-label">
                  <b-form-input size="sm" v-model="row.name" placeholder="Metadata name" maxlength="255" aria-label="Metadata name"
                                :state="getNewMetadataState(row, 'name')" @blur="row.touched.name = true" />
                  <b-form-invalid-feedback :state="getNewMetadataState(row, 'name')">{{ getNewMetadataError(row, 'name') }}</b-form-invalid-feedback>
                </div>
              </div>
              <div class="pp-field-value">
                <b-input-group size="sm">
                  <b-form-input v-model="row.value" placeholder="Value" aria-label="Metadata value"
                                :state="getNewMetadataState(row, 'value')" @blur="row.touched.value = true" />
                  <b-input-group-append>
                    <b-button variant="outline-secondary" class="pp-clear-button" title="Remove this row" aria-label="Remove this row" @click="newMetadataRows.splice(index, 1)">
                      <MdiIcon :path="icons.close" :size="16" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
                <b-form-invalid-feedback :state="getNewMetadataState(row, 'value')">{{ getNewMetadataError(row, 'value') }}</b-form-invalid-feedback>
              </div>
            </div>
            </div>
          </section>
        </div>
      </b-tab>

      <!-- Image gallery of the accession, same features as the images of the original passport page -->
      <b-tab :title="$t('pagePassportImageTitle')" lazy v-if="!isNew">
        <div class="pp-tab-panel">
          <PassportImageGallery v-if="germplasm" referenceTable="germinatebase" :foreignId="germplasm.germplasmId" @images-changed="loadReferenceImages" />
        </div>
      </b-tab>

      <!-- Pedigree: same tables and chart as the pedigree section of the original passport page -->
      <b-tab :title="$t('datasetTypePedigree')" lazy v-if="!isNew">
        <div class="pp-tab-panel" v-if="germplasm">
          <p class="pp-tab-intro" v-html="$t('pagePassportPedigreeText')" />

          <section class="pp-card pp-tab-card">
            <h2 class="pp-tab-card-title">Pedigree definitions</h2>
            <!-- Only the table scrolls sideways, not the page -->
            <div class="pp-scroll">
              <PedigreeDefinitionTable :getData="getPedigreeDefinitionData" :filterOn="pedigreeDefinitionFilter" />
            </div>
          </section>

          <section class="pp-card pp-tab-card">
            <h2 class="pp-tab-card-title">Parents and progeny</h2>
            <div class="pp-scroll">
              <PedigreeTable :getData="getPedigreeData" :filterOn="pedigreeFilter" />
            </div>
          </section>

          <!-- The chart shows itself only when there are pedigree datasets -->
          <section class="pp-card pp-tab-card pp-pedigree-chart">
            <div class="pp-scroll">
              <PedigreeChart :germplasm="germplasm" />
            </div>
          </section>
        </div>
      </b-tab>

      <!-- Entity: same content as the entity data section of the original passport page -->
      <b-tab title="Entity" lazy v-if="!isNew">
        <div class="pp-tab-panel" v-if="germplasm">
          <p class="pp-tab-intro" v-html="$t('pagePassportEntityText')" />

          <!-- The entity hierarchy, with the level of this germplasm highlighted -->
          <ol class="pp-entity-levels" aria-label="Entity hierarchy">
            <li v-for="(level, index) in entityLevels"
                :key="'pp-entity-level-' + level.name"
                :class="['pp-entity-level', { current: level.name === germplasm.entityTypeName }]"
                :aria-current="level.name === germplasm.entityTypeName ? 'true' : null">
              <MdiIcon v-if="index > 0" :path="icons.chevronRight" :size="18" class-name="pp-entity-arrow" />
              <span class="pp-entity-icon" :style="getEntityLevelStyle(level)"><MdiIcon :path="level.type.path" :size="16" /></span>
              <span>{{ level.type.text() }}</span>
            </li>
          </ol>

          <section class="pp-card pp-tab-card">
            <h2 class="pp-tab-card-title">{{ $t('pagePassportEntityTitle') }}</h2>
            <!-- Only the table scrolls sideways, not the page -->
            <div class="pp-scroll">
              <EntityTable :getData="getEntityData" :filterOn="entityFilter" />
            </div>
          </section>
        </div>
      </b-tab>

      <!-- Trait performance: only when the germplasm has trait data, like the section of the original passport page -->
      <b-tab title="Trait Performance" lazy v-if="traitStatsCount > 0">
        <div class="pp-tab-panel" v-if="germplasm">
          <p class="pp-tab-intro">{{ $t('pagePassportTraitStatsText') }}</p>

          <section class="pp-card pp-tab-card pp-trait-stats">
            <h2 class="pp-tab-card-title">{{ $t('pagePassportTraitStatsTitle') }}</h2>
            <!-- The traits wrap onto new rows, so nothing has to scroll -->
            <GermplasmTraitStats :germplasmId="germplasm.germplasmId" @has-data="count => traitStatsCount = count" />
          </section>
        </div>
      </b-tab>
    </b-tabs>

    <!-- Location modals of the original passport page: pick an existing location, or name a point picked on the map -->
    <template v-if="isDataCurator">
      <LocationSelectionModal @location-selected="onExistingLocationSelected" ref="locationSelectionModal" />
      <LocationCountrySelectionModal @selection-changed="onNewLocationNamed" ref="locationCountrySelectionModal" />
    </template>
  </div>
</template>

<script>
import MdiIcon from '@/components/icons/MdiIcon'
import LocationMap from '@/components/map/LocationMap'
import store from '@/store'
import DatasetEditModal from '@/components/modals/DatasetEditModal'
import AddPublicationModal from '@/components/modals/AddPublicationModal'
import PassportImageGallery from '@/components/images/PassportImageGallery'
import PedigreeDefinitionTable from '@/components/tables/PedigreeDefinitionTable'
import PedigreeTable from '@/components/tables/PedigreeTable'
import PedigreeChart from '@/components/charts/PedigreeChart'
import EntityTable from '@/components/tables/EntityTable'
import RecentlyViewedPanel from '@/components/germplasm/RecentlyViewedPanel'
import LocationSelectionModal from '@/components/modals/LocationSelectionModal'
import LocationCountrySelectionModal from '@/components/modals/LocationCountrySelectionModal'
import GermplasmTraitStats from '@/components/germplasm/GermplasmTraitStats'

import { mapGetters } from 'vuex'

import { apiPostGermplasmTable, apiPostGermplasmDatasetTable, apiGetGermplasmMcpd, apiPostGermplasmGroupTable, apiPostGermplasmAttributeTable, apiPostPedigreeTable, apiPostPedigreedefinitionTable, apiPostEntityTable, apiGetGermplasmStatsTraits, apiPatchGermplasmLocation } from '@/mixins/api/germplasm'
import { findFlagshipCrop } from '@/mixins/crops'
import { MAX_JAVA_INTEGER } from '@/mixins/api/base'
import { apiPostGroupTable, apiPatchGroupMembers } from '@/mixins/api/group'
import { getImageUrl } from '@/mixins/image'
import { MCPD_SAMPSTAT, MCPD_COLLSRC, MCPD_STORAGE, MCPD_SITEPROT, MCPD_POPSRC, MCPD_CONSACTION, formatMcpdCodes, getCountryFlagCode, getCountryName } from '@/mixins/mcpd'
import { apiPostGermplasmInstitutionTable, apiGetPublications, apiDeletePublicationReference, apiPostImages, apiGetAdminSettings } from '@/mixins/api/misc'
import { datasetTypes, germplasmInstitutionTypes, entityTypes } from '@/mixins/types'
import { getWiewsOrganisationUrl, getWiewsInstitutionName, getWiewsOrganizations } from '@/mixins/fao-wiews'
import InstitutionLookupResult from '@/components/germplasm/InstitutionLookupResult'
import { apiGetCountries, apiPostLocationTable } from '@/mixins/api/location'
import { EDITABLE_MCPD_FIELDS, SUBTAXA_RANKS, parseSubtaxa, CODE_DOMAINS, formatCode, findCode, splitCodes, updateGermplasmMcpd, updateGermplasmMetadata, createGermplasmMcpd } from '@/mixins/mcpd-update'
import { SUGGESTION_FIELDS, getMcpdSuggestions, getAllMcpdValues, clearMcpdSuggestions } from '@/mixins/mcpd-suggestions'
import VueTypeaheadBootstrap from 'vue-typeahead-bootstrap'
import { getHighContrastTextColor } from '@/mixins/colors'
import { isPageAvailable } from '@/mixins/util'
import { userIsAtLeast, USER_TYPE_DATA_CURATOR, USER_TYPE_ADMINISTRATOR } from '@/mixins/api/auth'

import { mdiBarley, mdiBarcode, mdiCheckboxBlankOutline, mdiCheckboxMarkedOutline, mdiChevronUp, mdiInformationOutline, mdiShovel, mdiHomeCity, mdiHandHeartOutline, mdiBookOpenVariant, mdiChevronLeft, mdiChevronRight, mdiOpenInNew, mdiDatabase, mdiPlus, mdiGroup, mdiShieldCheckOutline, mdiVectorLink, mdiTable, mdiMapMarker, mdiClose, mdiMagnifyScan, mdiPlaylistEdit, mdiContentSave, mdiBroom, mdiReload, mdiCancel, mdiSprout } from '@mdi/js'

const emitter = require('tiny-emitter/instance')

const DATASETS_PER_PAGE = 4

// Descriptors for Crop Wild Relatives conserved in situ (CWRI v.1), followed by in-situ germplasm
const CWRI_DESCRIPTORS_URL = 'https://openknowledge.fao.org/server/api/core/bitstreams/03b4bc43-b9a1-49c8-a4b1-a13458a642e6/content'

// How long each reference image stays in the header background
const REFERENCE_IMAGE_INTERVAL = 15000

// Fields of the Overview block, in the order and with the labels of the MCPD block of the original passport page.
// "code" is the MCPD acronym and "description" its MCPD definition, both shown in the popover of the field.
// Location type shown on the map for in-situ populations, in the same shape as the location types of the map
const IN_SITU_LOCATION_TYPE = {
  path: mdiMagnifyScan,
  color: () => store.getters.storeServerSettings ? store.getters.storeServerSettings.colorsTemplate[1 % store.getters.storeServerSettings.colorsTemplate.length] : null,
  text: () => 'Ocurrence site'
}

// Overview fields that are never editable: the accession number identifies the germplasm for the update, and the genus
// decides its taxonomy
const LOCKED_WHILE_EDITING = ['ACCENUMB', 'GENUS']

const OVERVIEW_FIELDS = [{
  // Additional attribute of the germplasm. First in the list, and only listed when the germplasm has it
  key: 'NICODE',
  source: 'attribute',
  onlyWithValue: true,
  // In-situ populations only (an ex-situ germplasm may have one, it isn't shown)
  onlyInSitu: true,
  i18n: 'widgetMcpdNationalInventory',
  country: true,
  code: 'NICODE',
  description: 'Code identifying the National Inventory; the Three-letter ISO 3166-1 code of the country preparing the National Inventory. Exceptions are possible if agreed with EURISCO, such as NGB.'
}, {
  key: 'puid',
  i18n: 'widgetMcpdPuid',
  doi: true,
  code: 'PUID',
  description: 'Any persistent, unique identifier assigned to the accession so it can be unambiguously referenced at the global level and the information associated with it harvested through automated means.'
}, {
  key: 'accename',
  i18n: 'widgetMcpdAccessionName',
  code: 'ACCENAME',
  description: 'Either a registered or other designation given to the material received, other than the donor’s accession number or collecting number.',
  inSitu: { label: 'Population name', description: 'Designation given to the population observed.' }
}, {
  key: 'accenumb',
  i18n: 'widgetMcpdAccessionNumber',
  code: 'ACCENUMB',
  description: 'This is the unique identifier for accessions within a genebank, and is assigned when a sample is entered into the genebank collection.',
  inSitu: { label: 'Population Identifier', description: 'Identifier of the population observed.' }
}, {
  key: 'sampstat',
  i18n: 'widgetMcpdBiologicalStatus',
  codes: MCPD_SAMPSTAT,
  code: 'SAMPSTAT',
  description: 'Biological status of the accession (e.g., wild, weedy, traditional cultivar/landrace, breeding material). The coding scheme proposed can be used at 3 different levels of detail: either by using the general codes (in boldface) such as 100, 200, 300, 400, or by using the more specific codes such as 110, 120, etc.'
}, {
  key: 'collsrc',
  i18n: 'widgetMcpdCollectingSource',
  codes: MCPD_COLLSRC,
  code: 'COLLSRC',
  hiddenInSitu: true,
  description: 'The source of the sample (e.g., wild habitat, farm, market). The coding scheme proposed can be used at 2 different levels of detail: either by using the general codes (in boldface) such as 10, 20, 30, 40, etc., or by using the more specific codes, such as 11, 12, etc.'
}, {
  key: 'collnumb',
  i18n: 'widgetMcpdCollectingNumber',
  code: 'COLLNUMB',
  hiddenInSitu: true,
  description: 'Original identifier assigned by the collector(s) of the sample, normally composed of the name or initials of the collector(s) followed by a number.'
}, {
  key: 'genus',
  i18n: 'widgetMcpdGenus',
  italic: true,
  code: 'GENUS',
  description: 'Genus name for taxon. Initial uppercase letter required.'
}, {
  key: 'species',
  i18n: 'widgetMcpdSpecies',
  italic: true,
  code: 'SPECIES',
  description: 'Specific epithet portion of the scientific name in lowercase letters. Only the following abbreviation is allowed: ‘sp.’'
}, {
  key: 'cropname',
  i18n: 'widgetMcpdCropName',
  code: 'CROPNAME',
  hiddenInSitu: true,
  description: 'Common name of the crop.'
}, {
  key: 'spauthor',
  i18n: 'widgetMcpdSpeciesAuth',
  code: 'SPAUTHOR',
  description: 'Provide the authority for the species name.'
}, {
  key: 'subtaxa',
  i18n: 'widgetMcpdSubtaxon',
  code: 'SUBTAXA',
  description: 'Subtaxon can be used to store any additional taxonomic identifier. The following abbreviations are allowed: ‘subsp.’ (for subspecies); ‘convar.’ (for convariety); ‘var.’ (for variety); ‘f.’ (for form); ‘Group’ (for ‘cultivar group’).'
}, {
  key: 'subtauthor',
  i18n: 'widgetMcpdSubtaxonAuth',
  code: 'SUBTAUTHOR',
  description: 'Provide the subtaxon authority at the most detailed taxonomic level.'
}, {
  key: 'origcty',
  i18n: 'widgetMcpdCountry',
  country: true,
  code: 'ORIGCTY',
  description: '3-letter ISO 3166-1 code of the country in which the sample was originally collected.',
  inSitu: { label: 'Country of ocurrence', description: 'Three-letter ISO 3166-1 code of the country where the CWR population was observed or inventoried.' }
}, {
  key: 'colldate',
  i18n: 'widgetMcpdColldate',
  code: 'COLLDATE',
  hiddenInSitu: true,
  description: 'Collecting date of the sample, where YYYY is the year, MM is the month, and DD is the day.'
}, {
  // Additional attribute of the germplasm, only listed when the germplasm has it. Several codes are separated by ";"
  key: 'SITEPROT',
  source: 'attribute',
  onlyWithValue: true,
  i18n: 'widgetMcpdSiteProtection',
  codes: MCPD_SITEPROT,
  // Several codes are shown one per line
  lines: true,
  code: 'SITEPROT',
  description: 'Indicate whether the site is protected under any legal or official protection.'
}, {
  key: 'storage',
  i18n: 'widgetMcpdStorage',
  codes: MCPD_STORAGE,
  // Several codes are shown one per line
  lines: true,
  code: 'STORAGE',
  hiddenInSitu: true,
  description: 'If germplasm is maintained under different types of storage.'
}, {
  // Additional attribute of the germplasm, only listed when the germplasm has it.
  // Numeric codes are shown as "<code> - <name>", a value without any number is shown as it is.
  key: 'POPSRC',
  source: 'attribute',
  onlyWithValue: true,
  i18n: 'widgetMcpdOccurrenceSiteStatus',
  codes: MCPD_POPSRC,
  textFallback: true,
  code: 'POPSRC',
  description: 'Habitat of the occurrence site of the population(s).'
}, {
  // Additional attribute of the germplasm, only listed when the germplasm has it. Several codes are separated by ";"
  key: 'CONSACTION',
  source: 'attribute',
  onlyWithValue: true,
  i18n: 'widgetMcpdConservationActions',
  codes: MCPD_CONSACTION,
  // Several codes are shown one per line
  lines: true,
  code: 'CONSACTION',
  description: 'Indication whether conservation actions related to the population are in place. Use the IUCN classification scheme for conservation actions in place. Multiple values are separated by a semicolon without space.'
}, {
  key: 'mlsstat',
  i18n: 'widgetMcpdMlsStatus',
  // Only 0 and 1 are valid, anything else counts as no value
  format: value => ({ 0: '0 - No', 1: '1 - Yes' })[`${value}`.trim()] || null,
  code: 'MLSSTAT',
  description: 'The status of an accession with regards to the Multilateral System (MLS) of the International Treaty on Plant Genetic Resources for Food and Agriculture.'
}, {
  // The MCPD value. (The synonyms of the germplasm are ACCENAME followed by these identifiers.)
  key: 'othernumb',
  i18n: 'widgetMcpdOtherIdentifiers',
  code: 'OTHERNUMB',
  // Several identifiers (separated by ";") are shown one per line
  lines: true,
  description: 'Any other identifiers known to exist in other collections for this accession.'
}]

// Additional attributes of the germplasm this page reads:
// IN-SITU (in-situ / ex-situ badge), LIAISONCODE (liaison institutions), NICODE, SITEPROT, POPSRC and CONSACTION (overview fields)
// Additional attributes left out of the Metadata tab: they are already shown elsewhere on the page or are not meant for it
const METADATA_HIDDEN_ATTRIBUTES = ['INSTNAME', 'LIAISONCODE', 'LIAISONNAME', 'POPSRC', 'SITEPROT', 'CONSACTION', 'IN-SITU']
// Hidden from the Metadata tab of in-situ populations only, which show them in the Overview (see onlyInSitu)
const METADATA_HIDDEN_IN_SITU_ATTRIBUTES = ['NICODE']

// "1 - Yes" for 1, "0 - No" for anything else
const formatYesNo = value => `${value}`.trim() === '1' ? '1 - Yes' : '0 - No'

// Additional attributes with their own label, help popover and value format on the Metadata tab.
// Attributes not listed here use their description (or their name in sentence case) as label and have no popover.
const METADATA_RULES = {
  // Same label and description as in the Overview of in-situ populations
  NICODE: {
    // A 3-letter country code: shown with its flag and name
    country: true,
    label: 'National inventory country',
    description: 'Code identifying the National Inventory; the Three-letter ISO 3166-1 code of the country preparing the National Inventory. Exceptions are possible if agreed with EURISCO, such as NGB.'
  },
  ACCEURL: {
    label: 'Accession URL',
    description: 'URL linking to additional data about the accession/population.'
  },
  REMARKS: {
    label: 'Remarks',
    description: 'The remarks field is used to add notes or elaborate on descriptors.'
  },
  HISTORIC: {
    label: 'Historic Values',
    format: formatYesNo
  },
  AEGISSTAT: {
    label: 'AEGIS Status',
    description: 'Either if germplasm is registered or not on AEGIS (A European Genebank Integrated System).',
    format: formatYesNo
  }
}

const isUrl = value => /^https?:\/\//i.test(value)

// How the Metadata attributes are edited: a country (its 3-letter code is saved), a URL, 0/1 (like MLSSTAT). Any other
// attribute is edited as text.
const METADATA_EDIT_TYPES = { NICODE: 'country', ACCEURL: 'url', AEGISSTAT: 'yesno', HISTORIC: 'yesno' }
// Acronym of a metadata name: its first 15 letters, spaces left out, in capitals
const getMetadataAcronym = name => `${name || ''}`.replace(/\s+/g, '').substring(0, 15).toUpperCase()
// A URL that can be saved for ACCEURL
const URL_PATTERN = /^https?:\/\/[^\s/$.?#][^\s]*$/i

const PAGE_ATTRIBUTES = ['IN-SITU', 'LIAISONCODE', 'NICODE', 'SITEPROT', 'POPSRC', 'CONSACTION']

// MCPD institutions (ex-situ and in-situ), with their institution type in Germinate (the maintenance institution,
// INSTCODE, is not among them: it can't be changed)
const MCPD_INSTITUTION_TYPES = [
  { type: 'collection', codeField: 'collcode', nameField: 'collname', addressField: 'collinstaddress' },
  { type: 'breeding', codeField: 'bredcode', nameField: 'bredname' },
  { type: 'donor', codeField: 'donorcode', nameField: 'donorname' },
  { type: 'duplicate', codeField: 'duplsite', nameField: 'duplinstname' }
]
// Institutions of in-situ populations: the liaison institution, kept in the LIAISONCODE and LIAISONNAME additional
// attributes (not a link to the germplasm like the MCPD ones)
const IN_SITU_INSTITUTION_TYPES = [
  // Same type key as LIAISON_INSTITUTION_TYPE_KEY (declared below)
  { type: 'liaison', codeField: 'LIAISONCODE', nameField: 'LIAISONNAME' }
]
// A new germplasm: its maintenance institution (INSTCODE), by its code
const NEW_INSTITUTION_TYPES = [
  { type: 'maintenance', codeField: 'instcode' }
]
// Its field (mandatory)
const NEW_MAINTENANCE_KEY = 'new-maintenance'
// Fields of a new germplasm that can't be left empty
const NEW_MANDATORY_FIELDS = ['accenumb', 'genus']
// Wait after the last key before looking up the ACCENUMB typed
const ACCENUMB_CHECK_DELAY = 400
// Germplasm whose name has every word of the ACCENUMB typed, compared without the spaces
const ACCENUMB_CHECK_LIMIT = 500
// Without spaces at the start or end, one space between the words
const normalizeSpaces = value => `${value === null || value === undefined ? '' : value}`.trim().replace(/\s+/g, ' ')
// Fields of a new germplasm that are never edited otherwise (shown in their place of OVERVIEW_FIELDS)
const CONSERVATION_FIELD = {
  key: 'conservation',
  code: 'CONSERVATION',
  label: 'Conservation Type',
  description: 'In-situ conservation means protecting and managing plant species directly within their natural habitats. Ex-situ conservation involves preserving plants outside their natural environments in artificial settings.'
}
const NEW_GERMPLASM_FIELDS = ['accenumb', 'genus']
// Group of a new germplasm, shown with CONSERVATION whatever the conservation type. The germplasm is added to the group
// once it is created.
const CROPSHIP_FIELD = {
  key: 'cropship',
  code: 'CROPSHIP',
  label: 'Group of Germplasm',
  description: 'Group of Germplasm association.'
}
// Fields of a new germplasm checked on saving, besides those of NEW_MANDATORY_FIELDS
const NEW_CHECKED_FIELDS = ['conservation', 'cropship']
// Wait after the last key before the pin follows the coordinates typed
const MAP_COORDINATES_DELAY = 500
// Times the created germplasm is looked for after the import
const NEW_GERMPLASM_FIND_ATTEMPTS = 4
const NEW_GERMPLASM_FIND_DELAY = 500
// An API call as a promise; rejected with the reason the server gave
const apiRequest = (apiFunction, ...args) => new Promise((resolve, reject) => {
  apiFunction(...args, result => resolve(result), {
    codes: [],
    callback: response => reject(new Error((response && response.data && (response.data.reasonPhrase || response.data.message)) || (response && response.statusText) || 'the server did not accept the request'))
  })
})
// FAO WIEWS institute code: 3-letter ISO 3166-1 country code and 3 digits, e.g. DEU146
const INSTITUTE_CODE_PATTERN = /^[A-Z]{3}[0-9]{3}$/

// Institutions taken from the LIAISONCODE attribute of the germplasm are shown with this type
const LIAISON_INSTITUTION_TYPE_KEY = 'liaison'
const LIAISON_INSTITUTION_TYPE = {
  path: mdiVectorLink,
  // Yellow background, the icon colour is picked for contrast
  color: () => '#FFD100',
  text: () => 'Liaison'
}

// Maintenance institutions are always listed first, the others keep the order they come in
const sortInstitutions = institutions => institutions
  .map((institution, index) => ({ institution, index, first: institution.institutionType === 'maintenance' ? 0 : 1 }))
  .sort((a, b) => a.first - b.first || a.index - b.index)
  .map(item => item.institution)
const PUBLICATIONS_PER_PAGE = 4

// CSL fields can be a plain value or a list, and titles can contain markup like <i>
const getCslText = value => {
  const text = Array.isArray(value) ? value[0] : value
  return text ? `${text}`.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim() : null
}

// Reads what the publication card of the original page shows from the cached citation ("publicationFallbackCache")
const toPassportPublication = publication => {
  let cache = {}

  try {
    cache = publication.publicationFallbackCache ? JSON.parse(publication.publicationFallbackCache) : {}
  } catch (e) {
    cache = {}
  }

  const dateParts = cache.issued && cache.issued['date-parts'] && cache.issued['date-parts'][0]
  const doi = publication.publicationDoi

  return {
    id: publication.publicationId,
    title: getCslText(cache.title) || 'N/A',
    year: dateParts && dateParts.length > 0 ? dateParts[0] : null,
    source: getCslText(cache['container-title']),
    // "Read more" on the original page uses the citation URL, else the DOI
    url: cache.URL || (doi ? (doi.startsWith('http') ? doi : `https://doi.org/${doi}`) : null)
  }
}

// Institution names that mean "unknown": the name is then looked up on FAO WIEWS
const isMissingName = name => !name || `${name}`.trim() === '' || `${name}`.trim().toUpperCase() === 'N/A'

// Used for dataset types this page does not know
const UNKNOWN_DATASET_TYPE = {
  path: mdiDatabase,
  color: () => null,
  text: () => ''
}

export default {
  props: {
    // The germplasm to show (id, name, display name or PUID). Without it, the one of the URL.
    germplasmId: {
      type: [Number, String],
      default: null
    },
    // Shown in a modal (e.g. the passport preview of the germplasm table) rather than as the page
    isPopup: {
      type: Boolean,
      default: false
    },
    // A germplasm being added (see "Add Germplasm" of the germplasm list): nothing is loaded, the passport starts empty
    isNew: {
      type: Boolean,
      default: false
    }
  },
  components: {
    InstitutionLookupResult,
    VueTypeaheadBootstrap,
    LocationMap,
    DatasetEditModal,
    AddPublicationModal,
    PassportImageGallery,
    PedigreeDefinitionTable,
    PedigreeTable,
    PedigreeChart,
    EntityTable,
    RecentlyViewedPanel,
    LocationSelectionModal,
    LocationCountrySelectionModal,
    GermplasmTraitStats,
    MdiIcon
  },
  data: function () {
    return {
      // Static first version of the page. Every block will be connected to the passport data one at a time.
      CWRI_DESCRIPTORS_URL,
      // Index of the open tab, 0 is Passport
      tabIndex: 0,
      // Row of this accession from the germplasm table. Null until loaded.
      germplasm: null,
      // MCPD of this accession, as on the original passport page. Null until loaded.
      mcpd: null,
      // Germplasm groups the accession belongs to
      groups: [],
      // Value of the IN-SITU attribute of the accession. Undefined until loaded, null when it has none.
      inSituValue: undefined,
      // Values of the additional attributes used on this page, keyed by attribute name (see PAGE_ATTRIBUTES)
      attributeValues: {},
      // All additional attributes of the germplasm, shown on the Metadata tab
      attributes: [],
      // Images of the accession marked as reference image, shown in the header background
      referenceImages: [],
      referenceImageIndex: 0,
      referenceImageTimer: null,
      // Number of traits with performance data for this germplasm, the tab only shows when there are any
      traitStatsCount: 0,
      // "PDCI calculation" from the administrator settings, only known to administrators. Null when unknown.
      adminPdciEnabled: null,
      // Data curators picking a new location on the (then full-width) map
      isSelectingOnMap: false,
      // Point picked on the map, waiting for its name and country
      pendingLocation: null,
      // Select on map: the coordinates typed, or those of the pin placed on the map
      mapCoordinates: { latitude: '', longitude: '' },
      // A new germplasm: its location, kept until the germplasm is created. { request (as for apiPatchGermplasmLocation),
      // location (as on the map) }
      newLocation: null,
      // Current page of the datasets of this accession
      datasets: [],
      datasetTotal: 0,
      datasetPage: 1,
      // All institutions of this accession (maintenance first), shown 4 at a time
      germplasmInstitutions: [],
      // Institution codes from the LIAISONCODE attribute of the germplasm, shown as "Liaison" institutions
      liaisonCodes: [],
      // Data curators editing the MCPD institutions (preview: nothing is saved yet)
      isEditingInstitutions: false,
      // A new germplasm: the institution types other than maintenance are shown
      newOtherInstitutions: false,
      // A new germplasm (isNew): its conservation type and its MCPD fields
      conservationOptions: ['Ex-situ', 'In-situ'],
      newConservation: null,
      newGermplasm: NEW_GERMPLASM_FIELDS.reduce((values, key) => ({ ...values, [key]: '' }), {}),
      // Fields of a new germplasm that were left (a mandatory one left empty shows its hint)
      newTouched: [],
      // A new germplasm: its group (CROPSHIP) as typed, and the germplasm groups of the database
      newCropship: '',
      newGroups: [],
      // Germplasm of the database with the ACCENUMB typed: { value, status: 'loading' | 'exists' | 'free' }
      accenumbCheck: null,
      // Every GENUS, SPECIES and CROPNAME of the database (see getAllMcpdValues)
      newAllValues: { genus: [], species: [], cropname: [] },
      // Institute codes typed for the missing types while editing, keyed "new-<type>", and the codes they started with
      institutionEdit: {},
      institutionOriginal: {},
      institutionTouched: [],
      // FAO WIEWS lookup of the changed codes, keyed like institutionEdit (see InstitutionLookupResult)
      institutionLookup: {},
      savingInstitutions: false,
      institutionSavePhase: null,
      // Names found on FAO WIEWS for institutions without one, keyed by institution code. Undefined while loading.
      wiewsNames: {},
      // All publications of this accession, shown 4 at a time
      publications: [],
      publicationPage: 1,
      // Data curators editing the Overview: the fields of EDITABLE_MCPD_FIELDS, keyed like the MCPD of the germplasm
      editableFields: EDITABLE_MCPD_FIELDS,
      isEditing: false,
      edit: Object.keys(EDITABLE_MCPD_FIELDS).reduce((values, key) => ({ ...values, [key]: '' }), {}),
      // An edited value was confirmed (field left or Enter), so the button offers to save the changes
      editCommitted: false,
      // Fields left at least once, they show the "empty" hint from then on
      touchedFields: [],
      // Countries of the database offered for ORIGCTY, by name. Loaded when editing starts.
      editCountries: [],
      // Codes offered for the coded fields while editing
      codeDomains: CODE_DOMAINS,
      // Fields with several codes while editing: one tag per value, joined with ";" into edit[key]
      tagValues: Object.keys(EDITABLE_MCPD_FIELDS).filter(key => EDITABLE_MCPD_FIELDS[key].multiCoded).reduce((values, key) => ({ ...values, [key]: [] }), {}),
      // Key of the field whose list of codes is open, null when none is
      tagMenuOpen: null,
      // MLSSTAT buttons
      mlsstatOptions: [{ value: '0', text: '0 - No' }, { value: '1', text: '1 - Yes' }],
      // SUBTAXA while editing: abbreviation and name, joined into edit.subtaxa
      subtaxaRank: null,
      subtaxaName: '',
      // Values already in the database for the fields of SUGGESTION_FIELDS, loaded when editing starts
      editSuggestions: SUGGESTION_FIELDS.reduce((values, key) => ({ ...values, [key]: [] }), {}),
      savingGermplasm: false,
      // Step of the save shown on the button: 'validating' while the server checks the change, then 'updating'
      savePhase: null,
      // Editing the Metadata tab: the values as edited (by attribute name), the fields left, the save
      isEditingMetadata: false,
      metadataEdit: {},
      metadataTouched: [],
      // The country field of the Metadata tab with the focus (it shows the text to search while focused)
      metadataFocus: null,
      // New metadata rows: { id, name, value, touched: { name, value } }
      newMetadataRows: [],
      newMetadataRowId: 0,
      // Adding metadata to the germplasm ([+]): the suggested predefined metadata and the new rows are shown
      addingMetadata: false,
      // Predefined metadata not to add (their row was removed)
      dismissedMetadata: [],
      savingMetadata: false,
      metadataSavePhase: null,
      // Which panels are expanded
      open: {
        overview: true,
        location: true,
        datasets: true,
        institutions: true,
        publications: true
      },
      icons: {
        wheat: mdiBarley,
        barcode: mdiBarcode,
        unchecked: mdiCheckboxBlankOutline,
        checked: mdiCheckboxMarkedOutline,
        chevronUp: mdiChevronUp,
        info: mdiInformationOutline,
        trials: mdiShovel,
        maintenance: mdiHandHeartOutline,
        collection: mdiHomeCity,
        publication: mdiBookOpenVariant,
        chevronLeft: mdiChevronLeft,
        chevronRight: mdiChevronRight,
        openInNew: mdiOpenInNew,
        plus: mdiPlus,
        group: mdiGroup,
        sprout: mdiSprout,
        standard: mdiShieldCheckOutline,
        table: mdiTable,
        mapMarker: mdiMapMarker,
        close: mdiClose,
        edit: mdiPlaylistEdit,
        save: mdiContentSave,
        broom: mdiBroom,
        reload: mdiReload,
        cancel: mdiCancel
      }
    }
  },
  computed: {
    ...mapGetters([
      'storeToken',
      'storeMarkedGermplasm',
      'storeServerSettings'
    ]),
    isMarked: function () {
      return !!this.germplasm && this.storeMarkedGermplasm.indexOf(this.germplasm.germplasmId) !== -1
    },
    isDataCurator: function () {
      return !!this.storeToken && userIsAtLeast(this.storeToken.userType, USER_TYPE_DATA_CURATOR)
    },
    publicationPageCount: function () {
      return Math.ceil(this.publications.length / PUBLICATIONS_PER_PAGE)
    },
    publicationsOnPage: function () {
      const start = (this.publicationPage - 1) * PUBLICATIONS_PER_PAGE
      return this.publications.slice(start, start + PUBLICATIONS_PER_PAGE)
    },
    // One row per additional attribute: name as acronym, description (or the name in sentence case) as label,
    // values split on ";" into lines, with a link icon for the ones that are URLs
    metadataFields: function () {
      const fields = []

      // REMARKS can also come with the MCPD of the germplasm
      const remarks = this.mcpd ? (this.mcpd.remarks || this.mcpd.REMARKS) : null
      const sources = [...this.attributes]
      if (remarks !== null && remarks !== undefined && `${remarks}`.trim() !== '') {
        sources.push({ attributeName: 'REMARKS', attributeValue: remarks })
      }

      sources
        .filter(a => a.attributeName && !METADATA_HIDDEN_ATTRIBUTES.includes(a.attributeName))
        .filter(a => !(this.conservation === 'In-situ' && METADATA_HIDDEN_IN_SITU_ATTRIBUTES.includes(a.attributeName)))
        .filter(a => a.attributeValue !== null && a.attributeValue !== undefined && `${a.attributeValue}`.trim() !== '')
        .forEach(a => {
          let field = fields.find(f => f.code === a.attributeName)

          const rule = METADATA_RULES[a.attributeName] || {}

          if (!field) {
            const name = `${a.attributeName}`
            const asName = !METADATA_RULES[name] && /[a-z\s]/.test(name)
            field = {
              code: name,
              acronym: asName ? getMetadataAcronym(name) : null,
              label: rule.label || a.attributeDescription || (asName ? normalizeSpaces(name) : (name.charAt(0).toUpperCase() + name.slice(1).toLowerCase())),
              description: rule.description || null,
              lines: []
            }
            fields.push(field)
          }

          `${a.attributeValue}`.split(';')
            .map(v => v.trim())
            .filter(v => v !== '')
            .forEach(v => {
              if (rule.country && getCountryName(v)) {
                field.lines.push({ text: getCountryName(v), flag: getCountryFlagCode(v), iso3: v.toUpperCase(), url: null })
                return
              }
              const text = rule.format ? rule.format(v) : v
              field.lines.push({ text: text, url: isUrl(text) ? text : null })
            })
        })

      return fields.filter(f => f.lines.length > 0)
    },
    // Values of the Metadata tab that can be edited, by attribute name: { source ('attribute', or 'mcpd' for the REMARKS
    // of the MCPD), original value }. null for an attribute with several values: the import only changes one per name.
    metadataEntries: function () {
      return this.metadataFields.reduce((entries, field) => {
        const records = this.attributes.filter(a => a.attributeName === field.code && a.attributeValue !== null && a.attributeValue !== undefined && `${a.attributeValue}`.trim() !== '')
        const remarks = field.code === 'REMARKS' && records.length === 0 && this.mcpd ? `${this.mcpd.remarks || this.mcpd.REMARKS || ''}`.trim() : ''
        let entry = null
        if (records.length === 1) {
          entry = { source: 'attribute', original: `${records[0].attributeValue}`.trim() }
        } else if (remarks) {
          entry = { source: 'mcpd', original: remarks }
        }
        return { ...entries, [field.code]: entry }
      }, {})
    },
    // Names of the Metadata values that were changed. Only these are saved.
    changedMetadata: function () {
      if (!this.isEditingMetadata) {
        return []
      }
      return Object.keys(this.metadataEntries).filter(code => this.metadataEntries[code] && this.isMetadataChanged(code))
    },
    // Some metadata of the germplasm can be edited (Edit Metadata is only shown then)
    hasEditableMetadata: function () {
      return Object.keys(this.metadataEntries).some(code => !!this.metadataEntries[code])
    },
    hasMetadataChanges: function () {
      return this.changedMetadata.length > 0
    },
    metadataIsValid: function () {
      return this.changedMetadata.every(code => !this.getMetadataError(code))
    },
    // A new germplasm: CONSERVATION, CROPSHIP, ACCENUMB (checked as not used), GENUS and the maintenance institution
    // (found on FAO WIEWS) are valid
    newMandatoryFilled: function () {
      if (!this.isNew) {
        return false
      }
      const accenumb = normalizeSpaces(this.newGermplasm.accenumb)
      const code = this.institutionEdit[NEW_MAINTENANCE_KEY]
      const lookup = this.institutionLookup[NEW_MAINTENANCE_KEY]
      return NEW_CHECKED_FIELDS.concat(NEW_MANDATORY_FIELDS).every(key => !this.getNewFieldError(key)) &&
        !!this.accenumbCheck && this.accenumbCheck.value === accenumb && this.accenumbCheck.status === 'free' &&
        !!code && !!lookup && lookup.status === 'found' && lookup.code === code
    },
    // A new germplasm: the metadata with their own label and format (see METADATA_RULES). NICODE of in-situ populations
    // is in the MCPD block.
    newMetadataFields: function () {
      return Object.keys(METADATA_RULES)
        .filter(code => !(code === 'NICODE' && this.conservation !== 'Ex-situ') && !this.dismissedMetadata.includes(code))
        .map(code => ({ code, acronym: null, label: METADATA_RULES[code].label, description: METADATA_RULES[code].description || null, lines: [] }))
    },
    // Predefined metadata filled in for a new germplasm (optional there: an empty one is not saved)
    newMetadataCodes: function () {
      return this.newMetadataFields.map(field => field.code).filter(code => this.getMetadataValueToSave(code) !== '')
    },
    // The predefined metadata (see METADATA_RULES) the germplasm doesn't have yet, suggested when adding metadata.
    // NICODE only for ex-situ germplasm (in-situ populations have it in the Overview).
    suggestedMetadataFields: function () {
      if (this.isNew) {
        return []
      }
      const present = this.metadataFields.map(field => field.code.toLowerCase())
      return Object.keys(METADATA_RULES)
        .filter(code => !(code === 'NICODE' && this.conservation !== 'Ex-situ') && !this.dismissedMetadata.includes(code))
        .filter(code => !present.includes(code.toLowerCase()) && !this.attributes.some(a => `${a.attributeName}`.toLowerCase() === code.toLowerCase()))
        .map(code => ({ code, acronym: null, label: METADATA_RULES[code].label, description: METADATA_RULES[code].description || null, lines: [], suggested: true }))
    },
    // Suggested metadata filled in
    suggestedMetadataCodes: function () {
      return this.addingMetadata ? this.suggestedMetadataFields.map(field => field.code).filter(code => this.getMetadataValueToSave(code) !== '') : []
    },
    // Every new metadata row has a name and a value that can be saved
    newMetadataComplete: function () {
      return this.newMetadataRows.length > 0 && this.newMetadataRows.every(row => !this.getNewMetadataError(row, 'name') && !this.getNewMetadataError(row, 'value'))
    },
    // "Save new": something to add, every row complete and every suggested metadata shown filled in (a row that isn't
    // wanted is removed)
    canSaveNewMetadata: function () {
      return (this.newMetadataRows.length > 0 || this.suggestedMetadataFields.length > 0) &&
        this.newMetadataRows.every(row => !this.getNewMetadataError(row, 'name') && !this.getNewMetadataError(row, 'value')) &&
        this.suggestedMetadataFields.every(field => !this.getMetadataError(field.code))
    },
    hasNewMetadata: function () {
      return this.newMetadataRows.some(row => row.name.trim() !== '' || row.value.trim() !== '') || this.suggestedMetadataCodes.length > 0
    },
    // Accession > Plant/Plot > Sample
    entityLevels: function () {
      return ['Accession', 'Plant/Plot', 'Sample'].map(name => ({ name: name, type: entityTypes[name] }))
    },
    // Same filter as the entity table of the original passport page: this germplasm as parent or as child
    entityFilter: function () {
      const id = this.germplasm ? this.germplasm.germplasmId : null
      return [{
        column: { name: 'entityParentId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }, {
        column: { name: 'entityChildId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }]
    },
    // Same filters as the pedigree tables of the original passport page
    pedigreeFilter: function () {
      const id = this.germplasm ? this.germplasm.germplasmId : null
      return [{
        column: { name: 'parentId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }, {
        column: { name: 'childId', type: Number },
        comparator: 'equals',
        operator: 'or',
        values: [id],
        canBeChanged: false
      }]
    },
    pedigreeDefinitionFilter: function () {
      return [{
        column: { name: 'germplasmId', type: Number },
        comparator: 'equals',
        operator: 'and',
        values: [this.germplasm ? this.germplasm.germplasmId : null],
        canBeChanged: false
      }]
    },
    // Institutions of the germplasm (maintenance first), followed by the liaison institutions from its attributes
    institutions: function () {
      const liaisons = this.liaisonCodes.map(code => ({
        institutionId: `liaison-${code}`,
        institutionCode: code,
        institutionName: null,
        institutionType: LIAISON_INSTITUTION_TYPE_KEY
      }))

      return [...this.germplasmInstitutions, ...liaisons]
    },
    // Some institute code was changed (a new one typed, or an existing one changed)
    hasInstitutionChanges: function () {
      return this.isEditingInstitutions && Object.keys(this.institutionEdit).some(key => this.institutionEdit[key] !== this.institutionOriginal[key])
    },
    // Every code is valid, and every changed one was found on FAO WIEWS
    institutionEditIsValid: function () {
      return Object.keys(this.institutionEdit).every(key => {
        if (this.getInstitutionCodeError(key)) {
          return false
        }
        const changed = this.institutionEdit[key] !== this.institutionOriginal[key] && this.institutionEdit[key] !== ''
        return !changed || (this.institutionLookup[key] && this.institutionLookup[key].status === 'found' && this.institutionLookup[key].code === this.institutionEdit[key])
      })
    },
    // MCPD institution types (ex-situ) the germplasm has no institution of
    // In-situ populations also have the liaison institution, when they have none
    missingInstitutionTypes: function () {
      if (this.isNew) {
        if (!this.newOtherInstitutions) {
          return NEW_INSTITUTION_TYPES
        }
        // The liaison institution is for in-situ populations
        return NEW_INSTITUTION_TYPES.concat(MCPD_INSTITUTION_TYPES, this.conservation === 'In-situ' ? IN_SITU_INSTITUTION_TYPES : [])
      }
      if (this.conservation !== 'Ex-situ' && this.conservation !== 'In-situ') {
        return []
      }
      const missing = MCPD_INSTITUTION_TYPES.filter(entry => !this.germplasmInstitutions.some(institution => institution.institutionType === entry.type))
      if (this.conservation === 'In-situ' && this.liaisonCodes.length === 0) {
        return missing.concat(IN_SITU_INSTITUTION_TYPES)
      }
      return missing
    },
    // The group shown in the header: the first germplasm group that is a flagship crop, else the first germplasm group
    // PDCI of the accession (0 to 10), null when it has none
    pdci: function () {
      const value = this.germplasm ? this.germplasm.pdci : null
      return value === null || value === undefined || isNaN(value) ? null : Math.min(10, Math.max(0, Number(value)))
    },
    // "PDCI calculation" (pdciEnabled): on shows the PDCI ("0.00/0" without a value), off hides it completely.
    // Only administrators receive this setting; for everyone else it counts as on, which is the Germinate default.
    pdciEnabled: function () {
      if (this.adminPdciEnabled !== null) {
        return this.adminPdciEnabled
      }
      const settings = this.storeServerSettings
      return !(settings && settings.pdciEnabled === false)
    },
    showPdci: function () {
      return this.pdciEnabled
    },
    pdciText: function () {
      return this.pdci === null ? '0.00/0' : `${this.pdci.toFixed(2)}/10`
    },
    // 10 fills the whole bar. The bar moves in whole steps: the PDCI is rounded to the nearest integer first.
    pdciFillPercent: function () {
      return this.pdci === null ? 0 : Math.round(this.pdci) * 10
    },
    accessionNumber: function () {
      return (this.mcpd && this.mcpd.accenumb) || (this.germplasm && this.germplasm.germplasmName) || null
    },
    accessionName: function () {
      return this.mcpd && this.mcpd.accename ? `${this.mcpd.accename}`.trim() : null
    },
    taxonomy: function () {
      if (!this.mcpd) {
        return null
      }

      return [this.mcpd.genus, this.mcpd.species, this.mcpd.spauthor]
        .filter(v => v !== null && v !== undefined && `${v}`.trim() !== '')
        .map(v => `${v}`.trim())
        .join(' ') || null
    },
    cropGroup: function () {
      const groups = this.groups
        .filter(g => g.groupType === 'germinatebase')
        .map(g => ({ groupName: g.groupName, crop: findFlagshipCrop(g.groupName) }))

      return groups.find(g => g.crop) || groups[0] || null
    },
    // Current values of the editable fields
    originalValues: function () {
      return Object.keys(EDITABLE_MCPD_FIELDS).reduce((values, key) => {
        const attribute = EDITABLE_MCPD_FIELDS[key].attribute
        const attributeValue = attribute ? this.attributeValues[attribute] : null
        // Attributes have a list of values (one here, the update only changes one)
        const value = attribute ? (Array.isArray(attributeValue) ? attributeValue[0] : attributeValue) : (this.mcpd ? this.mcpd[key] : null)
        return { ...values, [key]: value === null || value === undefined ? '' : `${value}`.trim() }
      }, {})
    },
    // Keys of the fields whose value was changed. Only these are saved.
    changedFields: function () {
      if (!this.isEditing) {
        return []
      }
      return Object.keys(EDITABLE_MCPD_FIELDS).filter(key => !this.isSameValue(key, this.edit[key], this.originalValues[key]))
    },
    hasUnsavedChanges: function () {
      return this.changedFields.length > 0
    },
    // Changed values, confirmed by leaving a field or pressing Enter
    hasPendingChanges: function () {
      return this.editCommitted && this.hasUnsavedChanges
    },
    // A changed field can't be emptied (the import can't clear a value)
    editIsValid: function () {
      return this.changedFields.every(key => !this.getEditError(key))
    },
    // The MCPD abbreviations, shown as "subsp. - Subspecies"
    subtaxaRankOptions: function () {
      return [{ value: null, text: 'Abbreviation', disabled: true }]
        .concat(SUBTAXA_RANKS.map(rank => ({ value: rank.value, text: `${rank.value} - ${rank.text}` })))
    },
    // Names of the existing SUBTAXA of the same genus, with the chosen abbreviation
    subtaxaNameSuggestions: function () {
      const names = (this.editSuggestions.subtaxa || [])
        .map(value => parseSubtaxa(value))
        .filter(parsed => parsed && (!this.subtaxaRank || parsed.rank === this.subtaxaRank))
        .map(parsed => parsed.name)
      return [...new Set(names)]
    },
    conservation: function () {
      if (this.inSituValue === undefined) {
        return null
      }

      return this.inSituValue !== null && `${this.inSituValue}`.trim() === '1' ? 'In-situ' : 'Ex-situ'
    },
    // A new germplasm: CONSERVATION first (the fields that follow are those of the type chosen, see newPassportFields)
    newGermplasmFields: function () {
      return [CONSERVATION_FIELD, CROPSHIP_FIELD]
    },
    overviewFields: function () {
      if (!this.mcpd) {
        return []
      }

      // In-situ populations use the CWRI labels, and some ex-situ (collecting, genebank) fields don't apply to them
      const inSitu = this.conservation === 'In-situ'

      // Shown and edited by the same rules: fields hidden for in-situ populations, fields only for them
      return OVERVIEW_FIELDS.filter(field => !(inSitu && field.hiddenInSitu) && !(!inSitu && field.onlyInSitu)).map(field => {
        let raw

        if (field.source === 'attribute') {
          // All values of the additional attribute with this name
          raw = this.attributeValues[field.key] || null
        } else {
          const record = field.source === 'germplasm' ? (this.germplasm || {}) : this.mcpd
          raw = record[field.key]
        }

        // Lists (e.g. synonyms) are shown separated by "; "
        if (Array.isArray(raw)) {
          raw = raw.filter(v => v !== null && v !== undefined && `${v}`.trim() !== '').map(v => `${v}`.trim()).join('; ')
        }

        const hasValue = raw !== null && raw !== undefined && `${raw}`.trim() !== ''
        const result = {
          key: field.key,
          editKey: EDITABLE_MCPD_FIELDS[field.key] ? field.key : null,
          code: field.code,
          label: inSitu && field.inSitu ? field.inSitu.label : this.$t(field.i18n),
          description: inSitu && field.inSitu ? field.inSitu.description : field.description,
          italic: field.italic,
          onlyWithValue: field.onlyWithValue,
          value: hasValue ? `${raw}`.trim() : null
        }

        if (hasValue && field.format) {
          result.value = field.format(raw)
        } else if (hasValue && field.codes) {
          // "<code> - <name>", several codes separated by "; "
          result.value = formatMcpdCodes(raw, field.codes) || (field.textFallback ? result.value : null)
        } else if (hasValue && field.values) {
          // Coded values, shown with their description like on the original page
          result.value = field.values[raw] || result.value
        } else if (hasValue && field.country) {
          result.flag = getCountryFlagCode(result.value)
          // The ISO-3 code is shown after the country name, in brackets
          result.iso3 = getCountryName(result.value) ? result.value.toUpperCase() : null
          result.value = getCountryName(result.value) || result.value
        } else if (hasValue && field.doi) {
          result.link = result.value.startsWith('http') ? result.value : `https://doi.org/${result.value}`
        }

        // Several values separated by ";": one per line
        if (field.lines && result.value) {
          result.lines = `${result.value}`.split(';').map(v => v.trim()).filter(v => v !== '')
        }

        return result
      // While editing too: a field shown only with a value (e.g. NICODE) stays hidden without one
      // A new germplasm has no values: its editable fields are all listed
      }).filter(result => !result.onlyWithValue || result.value || (this.isNew && result.editKey && inSitu))
    },
    // A new germplasm: once the conservation type is chosen, the editable fields of the Overview for it (ACCENUMB and
    // GENUS come first, with CONSERVATION)
    newPassportFields: function () {
      return this.newConservation ? this.overviewFields.filter(field => field.editKey || NEW_GERMPLASM_FIELDS.includes(field.key)) : []
    },
    // Some MCPD field of a new germplasm was filled in (the conservation type aside)
    hasNewMcpdData: function () {
      return Object.keys(this.newGermplasm).some(key => `${this.newGermplasm[key]}`.trim() !== '') || this.hasUnsavedChanges
    },
    // Something was filled in for a new germplasm
    hasNewGermplasmData: function () {
      return this.isNew && (!!this.newConservation || !!this.newLocation || this.newCropship.trim() !== '' || this.hasNewMetadata ||
        Object.keys(this.metadataEdit).some(code => `${this.metadataEdit[code] || ''}`.trim() !== '') ||
        Object.keys(this.newGermplasm).some(key => `${this.newGermplasm[key]}`.trim() !== '') ||
        this.hasUnsavedChanges || this.hasInstitutionChanges)
    },
    datasetPageCount: function () {
      return Math.ceil(this.datasetTotal / DATASETS_PER_PAGE)
    },
    locationMapKey: function () {
      return this.location ? `location-${this.location.locationLatitude}-${this.location.locationLongitude}` : 'no-location'
    },
    // Same location object as on the original passport page, null without coordinates
    location: function () {
      if (this.isNew) {
        return this.newLocation ? { ...this.newLocation.location, locationTypeDisplay: this.conservation === 'In-situ' ? IN_SITU_LOCATION_TYPE : null } : null
      }

      const g = this.germplasm

      if (!g || g.latitude === null || g.latitude === undefined || g.longitude === null || g.longitude === undefined) {
        return null
      }

      return {
        locationId: g.locationId !== undefined ? g.locationId : -1,
        locationLatitude: g.latitude,
        locationLongitude: g.longitude,
        locationElevation: g.elevation,
        locationName: g.location,
        locationType: 'collectingsites',
        // In-situ populations are observed where they grow: the site is shown as an occurrence site
        locationTypeDisplay: this.conservation === 'In-situ' ? IN_SITU_LOCATION_TYPE : null,
        countryName: g.countryName,
        countryCode2: g.countryCode,
        countryCode3: null
      }
    },
    // Same as the original passport page: the barcode is made from the germplasm name
    barcodeUrl: function () {
      const name = this.germplasm ? this.germplasm.germplasmName : ''
      return `https://cropgeeks.github.io/humbug/#/import?barcodes=${encodeURIComponent(name || '')}`
    }
  },
  watch: {
    'mapCoordinates.latitude': function () {
      this.onCoordinatesTyped()
    },
    'mapCoordinates.longitude': function () {
      this.onCoordinatesTyped()
    },
    // A new germplasm is in-situ or ex-situ as chosen (labels, standard note), like the IN-SITU attribute
    // The button of the modal follows the save (see GermplasmTableComponent)
    savingGermplasm: function (saving) {
      if (this.isNew) {
        this.$emit('save-state', { saving, phase: this.savePhase })
      }
    },
    savePhase: function (phase) {
      if (this.isNew) {
        this.$emit('save-state', { saving: this.savingGermplasm, phase })
      }
    },
    newConservation: function (value) {
      if (this.isNew) {
        this.inSituValue = value === 'In-situ' ? '1' : '0'
        // The passport fields are filled in like when editing
        if (!this.isEditing) {
          this.startEditing()
        }
      }
    },
    tagMenuOpen: function (open) {
      if (open) {
        document.addEventListener('mousedown', this.onDocumentPointerDown, true)
        document.addEventListener('touchstart', this.onDocumentPointerDown, true)
      } else {
        this.removeDocumentPointerListener()
      }
    },
    subtaxaRank: function () {
      this.updateEditedSubtaxa()
    },
    subtaxaName: function () {
      this.updateEditedSubtaxa()
    },
    // The map was hidden while another tab was open, so Leaflet has to measure it again
    tabIndex: function (newValue) {
      if (newValue === 0 && this.$refs.map) {
        this.$nextTick(() => this.$refs.map.invalidateSize())
      }
    }
  },
  methods: {
    // The text field of an editable field: the input of b-form-input, or the one inside the typeahead
    getEditInput: function (key) {
      const refs = this.$refs[`editInput-${key}`]
      const component = refs && refs[0]
      if (!component) {
        return null
      }
      return component.$refs && component.$refs.input ? component.$refs.input : component
    },
    // The typeahead of a list field, null for the other fields
    getEditTypeahead: function (key) {
      const refs = this.$refs[`editInput-${key}`]
      const component = refs && refs[0]
      return component && component.$refs && component.$refs.input ? component : null
    },
    // openList false: only the focus, the list of a list field stays closed until the field is clicked or typed in
    focusField: function (key, openList = true) {
      this.$nextTick(() => {
        const input = this.getEditInput(key)
        if (input) {
          input.focus()
        }
        const typeahead = this.getEditTypeahead(key)
        if (typeahead && !openList) {
          // The typeahead shows its list while it considers itself focused
          typeahead.isFocused = false
        }
      })
    },
    // The value is one of the list (case ignored): the whole list is offered, it only filters while typing something else
    isListValue: function (list, value) {
      const query = value === null || value === undefined ? '' : `${value}`.trim().toLowerCase()
      return query !== '' && (list || []).some(item => `${item}`.trim().toLowerCase() === query)
    },
    openSuggestionList: function (event, key) {
      const typeahead = this.getEditTypeahead(key)
      if (typeahead && event.target === typeahead.$refs.input) {
        typeahead.isFocused = true
      }
    },
    // Same value for this field: fields with ignoreCase don't count upper/lower case
    isSameValue: function (key, a, b) {
      if (this.isMultiCodedField(key)) {
        // The same codes, in any order
        const codesOf = value => splitCodes(value).map(part => {
          const item = findCode(key, part)
          return item ? `${item.code}` : part
        }).sort().join(';')
        return codesOf(a) === codesOf(b)
      }
      if (this.isCountryField(key)) {
        const codeOf = value => {
          const country = this.findCountry(value)
          return country ? country.countryCode3 : (value === null || value === undefined ? '' : `${value}`.trim().toUpperCase())
        }
        return codeOf(a) === codeOf(b)
      }
      if (this.isCodedField(key)) {
        const codeOf = value => {
          const item = findCode(key, value)
          return item ? `${item.code}` : (value === null || value === undefined ? '' : `${value}`.trim())
        }
        return codeOf(a) === codeOf(b)
      }
      const x = a === null || a === undefined ? '' : `${a}`.trim()
      const y = b === null || b === undefined ? '' : `${b}`.trim()
      return EDITABLE_MCPD_FIELDS[key].ignoreCase ? x.toLowerCase() === y.toLowerCase() : x === y
    },
    // The edited value, written like the existing value it matches ("Wheat" typed, "wheat" exists: "wheat" is saved)
    getValueToSave: function (key) {
      const value = this.edit[key].trim()
      if (this.isCountryField(key)) {
        // The 3-letter code is saved, not the name
        const country = this.findCountry(value)
        return country ? country.countryCode3 : value
      }
      if (this.isCodedField(key)) {
        // The code is saved, not the name
        const item = findCode(key, value)
        return item ? `${item.code}` : value
      }
      const existing = (this.editSuggestions[key] || []).find(suggestion => this.isSameValue(key, suggestion, value))
      return existing || value
    },
    formatCode,
    // "Germany (DEU)"
    formatCountry: function (country) {
      return `${country.countryName} (${country.countryCode3})`
    },
    // The country of a value: its 3-letter code, its name or the text shown for it (case is ignored)
    findCountry: function (value) {
      const query = value === null || value === undefined ? '' : `${value}`.trim().toLowerCase()
      if (!query) {
        return null
      }
      return this.editCountries.find(c => c.countryCode3.toLowerCase() === query || c.countryName.toLowerCase() === query || this.formatCountry(c).toLowerCase() === query) || null
    },
    loadCountries: function () {
      if (this.editCountries.length > 0) {
        return
      }
      apiGetCountries(result => {
        // "UNKNOWN COUNTRY ORIGIN" (id -1) is no country for the importer
        this.editCountries = (result || [])
          .filter(c => c.id !== -1 && c.countryCode2 && c.countryCode3)
          .sort((a, b) => a.countryName.localeCompare(b.countryName))
        // Shown by name once the countries are known, unless they were already changed
        Object.keys(EDITABLE_MCPD_FIELDS).filter(key => this.isCountryField(key)).forEach(key => {
          const country = this.findCountry(this.originalValues[key])
          if (this.isEditing && country && this.edit[key].trim() === this.originalValues[key]) {
            this.edit[key] = this.formatCountry(country)
          }
        })
      })
    },
    // The chosen button is the value: 0 (No) or 1 (Yes)
    setMlsstat: function (value) {
      this.edit.mlsstat = value
      this.commitEdit('mlsstat')
    },
    isMultiCodedField: function (key) {
      return !!EDITABLE_MCPD_FIELDS[key] && !!EDITABLE_MCPD_FIELDS[key].multiCoded
    },
    // The tags of a field, and its value joined with ";"
    setTags: function (key, tags) {
      this.tagValues = { ...this.tagValues, [key]: tags }
      this.edit[key] = tags.join(';')
    },
    addTag: function (key, item) {
      const tags = this.tagValues[key] || []
      if (!tags.includes(`${item.code}`)) {
        this.setTags(key, tags.concat([`${item.code}`]))
      }
      this.commitEdit(key)
      // Several can be chosen: the list stays open while there are codes left
      if (this.getTagOptions(key).length === 0) {
        this.tagMenuOpen = null
      }
    },
    removeTag: function (key, tag) {
      this.setTags(key, (this.tagValues[key] || []).filter(t => t !== tag))
      this.commitEdit(key)
    },
    onDocumentPointerDown: function (event) {
      const refs = this.tagMenuOpen ? this.$refs[`tagsField-${this.tagMenuOpen}`] : null
      const field = Array.isArray(refs) ? refs[0] : refs
      if (!field || !field.contains(event.target)) {
        this.tagMenuOpen = null
      }
    },
    removeDocumentPointerListener: function () {
      document.removeEventListener('mousedown', this.onDocumentPointerDown, true)
      document.removeEventListener('touchstart', this.onDocumentPointerDown, true)
    },
    // Closes the list of codes when the focus leaves the field
    onTagsFocusOut: function (event) {
      // relatedTarget is null when the focused option left the list: the click listener decides then
      if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
        this.tagMenuOpen = null
      }
    },
    // Codes of a field with several codes that are not chosen yet
    getTagOptions: function (key) {
      const tags = this.tagValues[key] || []
      return (CODE_DOMAINS[key] || []).filter(item => !tags.some(tag => findCode(key, tag) === item))
    },
    findCode,
    isLockedWhileEditing: function (field) {
      return this.isEditing && !this.isNew && LOCKED_WHILE_EDITING.includes(field.code)
    },
    isCountryField: function (key) {
      return !!EDITABLE_MCPD_FIELDS[key] && !!EDITABLE_MCPD_FIELDS[key].country
    },
    isCodedField: function (key) {
      return !!EDITABLE_MCPD_FIELDS[key] && !!EDITABLE_MCPD_FIELDS[key].coded
    },
    // With a value of the list in the field, the whole list is offered (it only filters while typing something else)
    isCodeSelected: function (key) {
      return !!findCode(key, this.edit[key])
    },
    hasSuggestions: function (key) {
      return SUGGESTION_FIELDS.includes(key)
    },
    loadSuggestions: function () {
      // Only values of germplasm with the same genus
      const genus = this.isNew ? (this.newGermplasm.genus.trim() || null) : (this.mcpd ? this.mcpd.genus : null)
      getMcpdSuggestions(genus).then(suggestions => {
        // A new germplasm: SPECIES and CROPNAME offer every value of the database, whatever the genus
        const all = this.isNew ? { species: this.newAllValues.species, cropname: this.newAllValues.cropname } : {}
        this.editSuggestions = { ...this.editSuggestions, ...suggestions, ...all }
      })
    },
    // A new germplasm: the conservation type decides the fields. Changing it with fields filled in resets them, after
    // asking.
    chooseConservation: function (option) {
      if (option === this.newConservation) {
        return
      }
      if (!this.newConservation || !this.hasNewMcpdData) {
        this.newConservation = option
        return
      }
      this.$bvModal.msgBoxConfirm('The MCPD fields will be reset. Do you really want to change the conservation type?', {
        title: 'Change conservation type',
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      }).then(value => {
        if (value) {
          this.resetNewMcpd()
          this.newConservation = option
        }
      })
    },
    // "Site, Country (lat, lng)" of the location of a new germplasm
    getNewLocationText: function () {
      const location = this.newLocation ? this.newLocation.location : null
      if (!location) {
        return ''
      }
      const coordinates = location.locationLatitude !== null && location.locationLatitude !== undefined && location.locationLongitude !== null && location.locationLongitude !== undefined
        ? ` (${Number(location.locationLatitude).toFixed(4)}, ${Number(location.locationLongitude).toFixed(4)})`
        : ''
      return [location.locationName, location.countryName].filter(v => v).join(', ') + coordinates
    },
    getMetadataType: function (code) {
      return METADATA_EDIT_TYPES[code] || 'text'
    },
    // "Edit Metadata": into the edit mode; "Save changes" once something was changed; nothing changed: out of it
    onMetadataButtonClick: function () {
      if (!this.isEditingMetadata) {
        this.startMetadataEditing()
      } else if (!this.hasMetadataChanges) {
        this.isEditingMetadata = false
      } else if (this.metadataIsValid) {
        this.saveMetadataChanges()
      } else {
        this.metadataTouched = [...this.changedMetadata]
      }
    },
    startMetadataEditing: function () {
      const values = {}
      Object.keys(this.metadataEntries).filter(code => this.metadataEntries[code]).forEach(code => {
        const original = this.metadataEntries[code].original
        const country = this.getMetadataType(code) === 'country' ? this.findCountry(original) : null
        values[code] = country ? this.formatCountry(country) : original
      })
      this.metadataEdit = values
      this.metadataTouched = []
      this.isEditingMetadata = true
      // Countries for NICODE: shown by name once they are known, unless they were already changed
      if (this.editCountries.length === 0) {
        apiGetCountries(result => {
          this.editCountries = (result || [])
            .filter(c => c.id !== -1 && c.countryCode2 && c.countryCode3)
            .sort((a, b) => a.countryName.localeCompare(b.countryName))
          Object.keys(values).filter(code => this.getMetadataType(code) === 'country').forEach(code => {
            const country = this.findCountry(this.metadataEntries[code] ? this.metadataEntries[code].original : null)
            if (this.isEditingMetadata && country && `${this.metadataEdit[code]}`.trim() === this.metadataEntries[code].original) {
              this.metadataEdit = { ...this.metadataEdit, [code]: this.formatCountry(country) }
            }
          })
        })
      }
    },
    cancelMetadataEditing: function () {
      // Adding: the rows and the suggested metadata go, after asking when something was typed in them
      if (this.addingMetadata) {
        const discardNew = this.hasNewMetadata
          ? this.$bvModal.msgBoxConfirm('Do you really want to discard the metadata being added?', {
            title: 'Discard new metadata',
            okVariant: 'danger',
            okTitle: this.$t('genericYes'),
            cancelTitle: this.$t('genericNo')
          })
          : Promise.resolve(true)
        discardNew.then(value => {
          if (value) {
            this.stopAddingMetadata()
          }
        })
        return
      }
      const discard = this.hasMetadataChanges
        ? this.$bvModal.msgBoxConfirm('You have changes that were not saved. Do you really want to discard them?', {
          title: 'Unsaved changes',
          okVariant: 'danger',
          okTitle: this.$t('genericYes'),
          cancelTitle: this.$t('genericNo')
        })
        : Promise.resolve(true)
      discard.then(value => {
        if (value) {
          this.isEditingMetadata = false
          this.metadataTouched = []
        }
      })
    },
    setMetadataValue: function (code, value) {
      this.metadataEdit = { ...this.metadataEdit, [code]: value }
      this.touchMetadata(code)
    },
    // ACCEURL takes no spaces
    onMetadataInput: function (code, value) {
      const cleaned = this.getMetadataType(code) === 'url' ? `${value || ''}`.replace(/\s+/g, '') : value
      this.metadataEdit = { ...this.metadataEdit, [code]: cleaned }
    },
    clearMetadata: function (code) {
      this.metadataEdit = { ...this.metadataEdit, [code]: '' }
      this.touchMetadata(code)
      this.focusField(`meta-${code}`)
    },
    touchMetadata: function (code) {
      if (!this.metadataTouched.includes(code)) {
        this.metadataTouched.push(code)
      }
    },
    onMetadataFocusOut: function (event, code) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.touchMetadata(code)
        if (this.metadataFocus === code) {
          this.metadataFocus = null
        }
      }
    },
    // [+]: the first click shows the suggested metadata (when the germplasm misses some), each other one a new row
    addMetadataRow: function () {
      if (!this.isNew && !this.addingMetadata) {
        this.addingMetadata = true
        this.metadataEdit = this.suggestedMetadataFields.reduce((values, field) => ({ ...values, [field.code]: '' }), {})
        this.metadataTouched = []
        this.metadataFocus = null
        if (this.suggestedMetadataFields.length > 0) {
          return
        }
      }
      this.newMetadataRowId++
      this.newMetadataRows.push({ id: this.newMetadataRowId, name: '', value: '', touched: { name: false, value: false } })
    },
    // Why the name or value of a new metadata row can't be saved, null when it can
    getNewMetadataError: function (row, part) {
      if (part === 'value') {
        return row.value.trim() === '' ? 'Field cannot be empty' : null
      }
      const name = normalizeSpaces(row.name)
      if (name === '') {
        return 'Field cannot be empty'
      }
      const lower = name.toLowerCase()
      // Attributes the page uses or keeps out of the tab
      if (PAGE_ATTRIBUTES.concat(METADATA_HIDDEN_ATTRIBUTES).some(n => n.toLowerCase() === lower)) {
        return 'This name is reserved'
      }
      // The predefined metadata are in the list above (a new germplasm, or suggested)
      if ((this.isNew || this.addingMetadata) && Object.keys(METADATA_RULES).some(n => n.toLowerCase() === lower)) {
        return 'This metadata is already in the list above'
      }
      if (this.attributes.some(a => normalizeSpaces(a.attributeName).toLowerCase() === lower)) {
        return 'The germplasm already has this metadata'
      }
      // Also written another way (spaces, case): the same acronym as one of its metadata
      const acronym = getMetadataAcronym(name)
      if (this.attributes.some(a => getMetadataAcronym(a.attributeName) === acronym)) {
        return 'The germplasm already has this metadata'
      }
      if (this.newMetadataRows.some(other => other !== row && other.id < row.id && normalizeSpaces(other.name).toLowerCase() === lower)) {
        return 'This name was already added above'
      }
      return null
    },
    // Red once left empty; a name that can't be used at once
    getNewMetadataState: function (row, part) {
      const error = this.getNewMetadataError(row, part)
      if (!error) {
        return null
      }
      return row.touched[part] || error !== 'Field cannot be empty' ? false : null
    },
    // The row of a predefined metadata goes: it is not added
    dismissMetadata: function (code) {
      if (!this.dismissedMetadata.includes(code)) {
        this.dismissedMetadata.push(code)
      }
      this.metadataEdit = { ...this.metadataEdit, [code]: '' }
      this.metadataTouched = this.metadataTouched.filter(c => c !== code)
    },
    stopAddingMetadata: function () {
      this.addingMetadata = false
      this.dismissedMetadata = []
      this.newMetadataRows = []
      this.metadataEdit = {}
      this.metadataTouched = []
    },
    // "Save new": the suggested metadata filled in and the new rows are added to the germplasm (the import creates an
    // attribute it doesn't know yet; REMARKS is an MCPD field)
    saveNewMetadata: function () {
      this.newMetadataRows.forEach(row => { row.touched.name = true; row.touched.value = true })
      this.suggestedMetadataFields.forEach(field => this.touchMetadata(field.code))
      if (!this.canSaveNewMetadata) {
        return
      }
      const fields = {}
      const attributes = this.newMetadataRows.reduce((values, row) => ({ ...values, [normalizeSpaces(row.name)]: row.value.trim() }), {})
      this.suggestedMetadataFields.map(field => field.code).forEach(code => {
        const value = this.getMetadataValueToSave(code)
        if (code === 'REMARKS') {
          fields.remarks = value
        } else {
          attributes[code] = value
        }
      })

      this.savingMetadata = true
      this.metadataSavePhase = 'validating'

      updateGermplasmMetadata(this.germplasm, this.mcpd, { fields, attributes }, this.storeServerSettings.dataImportMode, phase => { this.metadataSavePhase = phase })
        .then(() => {
          this.stopAddingMetadata()
          this.loadAttributes()
          if (fields.remarks !== undefined) {
            this.loadMcpd()
          }
          emitter.emit('toast', {
            message: 'The new metadata were added to the germplasm.',
            title: 'Changes saved',
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })
        })
        .catch(error => {
          emitter.emit('toast', {
            message: `The new metadata could not be saved. ${error.message}`,
            title: 'Changes not saved',
            variant: 'danger',
            noAutoHide: true,
            appendToast: true
          })
        })
        .finally(() => {
          this.savingMetadata = false
          this.metadataSavePhase = null
        })
    },
    // The value saved: the 3-letter code of a country, the text without spaces around it otherwise
    getMetadataValueToSave: function (code) {
      const value = `${this.metadataEdit[code] === null || this.metadataEdit[code] === undefined ? '' : this.metadataEdit[code]}`.trim()
      if (this.getMetadataType(code) === 'country') {
        const country = this.findCountry(value)
        return country ? country.countryCode3 : value
      }
      return value
    },
    isMetadataChanged: function (code) {
      const entry = this.metadataEntries[code]
      const value = this.getMetadataValueToSave(code)
      return this.getMetadataType(code) === 'country' ? value.toUpperCase() !== entry.original.toUpperCase() : value !== entry.original
    },
    // Why the edited value can't be saved, null when it can
    getMetadataError: function (code) {
      const value = this.getMetadataValueToSave(code)
      const type = this.getMetadataType(code)
      if (value === '') {
        return 'Field cannot be empty'
      }
      if (type === 'country' && !this.findCountry(value)) {
        return 'Choose one of the countries of the list'
      }
      if (type === 'url' && !URL_PATTERN.test(value)) {
        return 'Enter a URL starting with http:// or https://'
      }
      if (type === 'yesno' && value !== '0' && value !== '1') {
        return 'Choose 0 - No or 1 - Yes'
      }
      return null
    },
    // Red field and hint once a changed field was left with a value that can't be saved
    getMetadataState: function (code) {
      // A new germplasm: optional, only a value that can't be saved is red
      if (this.isNew) {
        return this.metadataTouched.includes(code) && this.getMetadataValueToSave(code) !== '' && this.getMetadataError(code) ? false : null
      }
      // Adding to a germplasm: a suggested metadata shown is mandatory (its row is removed when it isn't wanted)
      if (this.addingMetadata && this.suggestedMetadataFields.some(field => field.code === code)) {
        return this.metadataTouched.includes(code) && this.getMetadataError(code) ? false : null
      }
      return this.metadataTouched.includes(code) && this.changedMetadata.includes(code) && this.getMetadataError(code) ? false : null
    },
    // Only the changed values: the attributes by name, REMARKS of the MCPD as an MCPD field
    saveMetadataChanges: function () {
      const fields = {}
      const attributes = {}
      this.changedMetadata.forEach(code => {
        const value = this.getMetadataValueToSave(code)
        if (this.metadataEntries[code].source === 'mcpd') {
          fields.remarks = value
        } else {
          attributes[code] = value
        }
      })

      this.savingMetadata = true
      this.metadataSavePhase = 'validating'

      updateGermplasmMetadata(this.germplasm, this.mcpd, { fields, attributes }, this.storeServerSettings.dataImportMode, phase => { this.metadataSavePhase = phase })
        .then(() => {
          this.isEditingMetadata = false
          this.metadataTouched = []
          this.loadAttributes()
          if (fields.remarks !== undefined) {
            this.loadMcpd()
          }
          emitter.emit('toast', {
            message: 'The changes to the metadata were saved.',
            title: 'Changes saved',
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })
        })
        .catch(error => {
          emitter.emit('toast', {
            message: `The changes could not be saved. ${error.message}`,
            title: 'Changes not saved',
            variant: 'danger',
            noAutoHide: true,
            appendToast: true
          })
        })
        .finally(() => {
          this.savingMetadata = false
          this.metadataSavePhase = null
        })
    },
    // Germplasm groups of the database (only those of germplasm)
    loadNewGroups: function () {
      apiPostGroupTable({ page: 1, limit: MAX_JAVA_INTEGER }, result => {
        this.newGroups = ((result && result.data) || [])
          .filter(group => group.groupType === 'germinatebase' && group.groupName)
          .sort((a, b) => a.groupName.localeCompare(b.groupName, undefined, { sensitivity: 'base' }))
      })
    },
    // The group with this name (case is ignored), null when there is none
    findNewGroup: function (name) {
      const wanted = normalizeSpaces(name).toLowerCase()
      return wanted ? this.newGroups.find(group => normalizeSpaces(group.groupName).toLowerCase() === wanted) || null : null
    },
    // Icon of the flagship crop of the group, a sprout for the other groups
    getGroupIcon: function (name) {
      const crop = findFlagshipCrop(name)
      return crop ? crop.icon : this.icons.sprout
    },
    getGroupIconStyle: function (name) {
      const crop = findFlagshipCrop(name)
      return { color: `var(--cp-crop-${crop ? crop.key : 'other'}-fg)` }
    },
    // Leaving CROPSHIP: its hint, and the name of the group as written in the database
    onNewCropshipFocusOut: function (event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        if (!this.newTouched.includes('cropship')) {
          this.newTouched.push('cropship')
        }
        const group = this.findNewGroup(this.newCropship)
        if (group) {
          this.newCropship = group.groupName
        }
      }
    },
    // A germplasm of the database with this ACCENUMB (spaces and case don't count), null when there is none
    findGermplasmByAccenumb: function (accenumb) {
      const value = normalizeSpaces(accenumb)
      const filter = value.split(' ').map(word => ({ column: 'germplasmName', comparator: 'contains', operator: 'and', values: [word] }))
      return apiRequest(apiPostGermplasmTable, { page: 1, limit: ACCENUMB_CHECK_LIMIT, filter })
        .then(result => ((result && result.data) || []).find(g => normalizeSpaces(g.germplasmName).toLowerCase() === value.toLowerCase()) || null)
    },
    // The germplasm just imported (the import may still be finishing)
    findCreatedGermplasm: function (accenumb, attempt = 1) {
      return this.findGermplasmByAccenumb(accenumb).then(germplasm => {
        if (germplasm || attempt >= NEW_GERMPLASM_FIND_ATTEMPTS) {
          return germplasm
        }
        return new Promise(resolve => setTimeout(resolve, NEW_GERMPLASM_FIND_DELAY)).then(() => this.findCreatedGermplasm(accenumb, attempt + 1))
      })
    },
    // "Save Germplasm" of the Add Germplasm modal: checks the mandatory fields, creates the germplasm through the MCPD
    // import (insert mode), then links it to its location and adds it to its group
    saveNewGermplasm: function () {
      if (!this.isNew || this.savingGermplasm) {
        return
      }

      // Every hint shows now
      NEW_CHECKED_FIELDS.concat(NEW_MANDATORY_FIELDS).forEach(key => {
        if (!this.newTouched.includes(key)) {
          this.newTouched.push(key)
        }
      })
      if (!this.institutionTouched.includes(NEW_MAINTENANCE_KEY)) {
        this.institutionTouched.push(NEW_MAINTENANCE_KEY)
      }
      // The filled in fields of the conservation type chosen
      const fieldKeys = this.newPassportFields.map(field => field.editKey).filter(key => key && this.changedFields.includes(key))
      this.touchedFields = [...new Set(this.touchedFields.concat(fieldKeys))]
      this.editCommitted = true

      // The metadata filled in, and the new metadata rows
      this.newMetadataCodes.forEach(code => this.touchMetadata(code))
      this.newMetadataRows.forEach(row => { row.touched.name = true; row.touched.value = true })
      const metadataValid = this.newMetadataCodes.every(code => !this.getMetadataError(code)) &&
        this.newMetadataRows.every(row => !this.getNewMetadataError(row, 'name') && !this.getNewMetadataError(row, 'value'))

      const maintenanceCode = this.institutionEdit[NEW_MAINTENANCE_KEY]
      const maintenanceLookup = this.institutionLookup[NEW_MAINTENANCE_KEY]
      const valid = metadataValid && NEW_CHECKED_FIELDS.concat(NEW_MANDATORY_FIELDS).every(key => !this.getNewFieldError(key)) &&
        fieldKeys.every(key => !this.getEditError(key)) &&
        this.institutionEditIsValid &&
        !!maintenanceCode && !!maintenanceLookup && maintenanceLookup.status === 'found' && maintenanceLookup.code === maintenanceCode
      if (!valid) {
        emitter.emit('toast', {
          message: 'Fill in the mandatory fields and correct the ones in red before saving.',
          title: 'Germplasm not saved',
          variant: 'warning',
          autoHideDelay: 5000,
          appendToast: true
        })
        return
      }

      const accenumb = normalizeSpaces(this.newGermplasm.accenumb)
      const group = this.findNewGroup(this.newCropship)
      const fields = fieldKeys.reduce((values, key) => ({ ...values, [key]: this.getValueToSave(key) }), {})
      // The other institutions, with the name and address found on FAO WIEWS
      this.missingInstitutionTypes.filter(entry => entry.type !== 'maintenance').forEach(entry => {
        const key = `new-${entry.type}`
        const lookup = this.institutionLookup[key]
        const code = this.institutionEdit[key]
        if (!code || !lookup || lookup.status !== 'found' || lookup.code !== code) {
          return
        }
        fields[entry.codeField] = code
        if (lookup.name) {
          fields[entry.nameField] = lookup.name.substring(0, 255)
        }
        if (entry.addressField && lookup.address) {
          fields[entry.addressField] = lookup.address
        }
      })
      // In-situ populations have the IN-SITU attribute (1), see conservation.js
      const attributes = this.newConservation === 'In-situ' ? { 'IN-SITU': '1' } : {}
      // The metadata: REMARKS is an MCPD field, the others additional attributes (NICODE as its 3-letter code)
      this.newMetadataCodes.forEach(code => {
        const value = this.getMetadataValueToSave(code)
        if (code === 'REMARKS') {
          fields.remarks = value
        } else {
          attributes[code] = value
        }
      })
      this.newMetadataRows.forEach(row => {
        attributes[normalizeSpaces(row.name)] = row.value.trim()
      })

      this.savingGermplasm = true
      this.savePhase = 'validating'

      // The identifier may have been taken meanwhile
      this.findGermplasmByAccenumb(accenumb)
        .then(existing => {
          if (existing) {
            this.accenumbCheck = { value: accenumb, status: 'exists' }
            throw new Error('A germplasm with this identifier already exists in the database.')
          }
          return createGermplasmMcpd({ accenumb, genus: this.newGermplasm.genus, instcode: maintenanceCode, fields, attributes }, this.storeServerSettings.dataImportMode, phase => { this.savePhase = phase })
        })
        .then(() => this.findCreatedGermplasm(accenumb))
        .then(germplasm => {
          if (!germplasm) {
            throw new Error('The import was done, but the new germplasm was not found.')
          }
          // Only once the germplasm exists: its location, then its group
          const location = this.newLocation ? apiRequest(apiPatchGermplasmLocation, germplasm.germplasmId, this.newLocation.request) : Promise.resolve()
          return location
            .then(() => apiRequest(apiPatchGroupMembers, group.groupId, 'germplasm', { ids: [germplasm.germplasmId], addition: true }))
            .then(() => germplasm, error => {
              throw new Error(`The germplasm ${accenumb} was created, but its location or group could not be set: ${error.message}.`)
            })
        })
        .then(germplasm => {
          // A new value is suggested next time
          clearMcpdSuggestions()
          emitter.emit('toast', {
            message: `The germplasm ${accenumb} was created.`,
            title: 'Germplasm saved',
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })
          this.$emit('germplasm-created', germplasm)
        })
        .catch(error => {
          emitter.emit('toast', {
            message: `The germplasm could not be saved. ${error.message}`,
            title: 'Germplasm not saved',
            variant: 'danger',
            noAutoHide: true,
            appendToast: true
          })
        })
        .finally(() => {
          this.savingGermplasm = false
          this.savePhase = null
        })
    },
    // Every MCPD field of a new germplasm empty again
    resetNewMcpd: function () {
      Object.keys(this.newGermplasm).forEach(key => { this.newGermplasm[key] = '' })
      this.newTouched = []
      clearTimeout(this.accenumbCheckTimer)
      this.accenumbCheck = null
      this.tagMenuOpen = null
      this.startEditing()
    },
    loadNewAllValues: function () {
      getAllMcpdValues().then(values => {
        this.newAllValues = values
        if (this.isEditing) {
          this.loadSuggestions()
        }
      })
    },
    // Leaving GENUS, not just moving to its list or its clear button: its hint, and the suggestions of its genus
    onNewGenusFocusOut: function (event) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        if (!this.newTouched.includes('genus')) {
          this.newTouched.push('genus')
        }
        this.loadSuggestions()
      }
    },
    // Red field and hint once a mandatory field was left empty
    // Why the value of a new germplasm field can't be used, null when it can
    getNewFieldError: function (key) {
      if (key === 'conservation') {
        return this.newConservation ? null : 'Choose the conservation type'
      }
      if (key === 'cropship') {
        if (this.newCropship.trim() === '') {
          return 'Field cannot be empty'
        }
        return this.findNewGroup(this.newCropship) ? null : 'Choose one of the groups of the list'
      }
      const value = `${this.newGermplasm[key]}`.trim()
      if (NEW_MANDATORY_FIELDS.includes(key) && value === '') {
        return 'Field cannot be empty'
      }
      if (key === 'accenumb' && this.accenumbCheck && this.accenumbCheck.value === normalizeSpaces(value) && this.accenumbCheck.status === 'exists') {
        return 'A germplasm with this identifier already exists in the database'
      }
      return null
    },
    // Red field and hint: empty once left, already used as soon as it is known
    getNewFieldState: function (key) {
      const error = this.getNewFieldError(key)
      if (!error) {
        return null
      }
      // An ACCENUMB already used is shown at once, the rest once the field was left
      return this.newTouched.includes(key) || (key === 'accenumb' && error !== 'Field cannot be empty') ? false : null
    },
    touchNewField: function (key) {
      if (!this.newTouched.includes(key)) {
        this.newTouched.push(key)
      }
      if (key === 'accenumb') {
        this.checkAccenumb()
      }
    },
    onNewFieldInput: function (key) {
      if (key !== 'accenumb') {
        return
      }
      clearTimeout(this.accenumbCheckTimer)
      this.accenumbCheckTimer = setTimeout(() => this.checkAccenumb(), ACCENUMB_CHECK_DELAY)
    },
    // Looks for a germplasm with the ACCENUMB typed (the importer uses it as the germplasm name)
    checkAccenumb: function () {
      clearTimeout(this.accenumbCheckTimer)
      const value = normalizeSpaces(this.newGermplasm.accenumb)
      if (value === '') {
        this.accenumbCheck = null
        return
      }
      if (this.accenumbCheck && this.accenumbCheck.value === value) {
        return
      }
      this.accenumbCheck = { value, status: 'loading' }
      // Names with every word, whatever the spaces around them (e.g. "MV  Karizma " is "MV Karizma"), compared here
      const filter = value.split(' ').map(word => ({ column: 'germplasmName', comparator: 'contains', operator: 'and', values: [word] }))
      apiPostGermplasmTable({ page: 1, limit: ACCENUMB_CHECK_LIMIT, filter }, result => {
        // Changed again meanwhile: that one counts
        if (!this.accenumbCheck || this.accenumbCheck.value !== value) {
          return
        }
        const exists = !!(result && result.data && result.data.some(g => normalizeSpaces(g.germplasmName).toLowerCase() === value.toLowerCase()))
        this.accenumbCheck = { value, status: exists ? 'exists' : 'free' }
      }, {
        codes: [],
        callback: () => {
          if (this.accenumbCheck && this.accenumbCheck.value === value) {
            this.accenumbCheck = null
          }
        }
      })
    },
    // Leaving the typeahead, not just moving to its list of suggestions or its clear button
    onSuggestionFocusOut: function (event, key) {
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.commitEdit(key)
      }
    },
    startEditing: function () {
      Object.keys(EDITABLE_MCPD_FIELDS).forEach(key => { this.edit[key] = this.originalValues[key] })
      this.editCommitted = false
      this.touchedFields = []
      this.loadCountries()
      Object.keys(this.tagValues).forEach(key => this.setTags(key, splitCodes(this.originalValues[key])))
      // A current code is shown as "100 - Wild", anything else as it is
      Object.keys(CODE_DOMAINS).filter(key => this.isCodedField(key)).forEach(key => {
        const item = findCode(key, this.originalValues[key])
        this.edit[key] = item ? formatCode(item) : this.originalValues[key]
      })
      const subtaxa = parseSubtaxa(this.originalValues.subtaxa)
      this.subtaxaRank = subtaxa ? subtaxa.rank : null
      this.subtaxaName = subtaxa ? subtaxa.name : this.originalValues.subtaxa
      this.isEditing = true
      this.open.overview = true
      this.loadSuggestions()
      // The typeahead has no maxlength option: set it on its text field
      this.$nextTick(() => SUGGESTION_FIELDS.forEach(key => {
        const input = this.getEditInput(key)
        if (input && EDITABLE_MCPD_FIELDS[key]) {
          input.setAttribute('maxlength', EDITABLE_MCPD_FIELDS[key].maxLength)
        }
      }))
      // First editable field in the order of the Overview
      const first = this.overviewFields.find(field => field.editKey)
      // A new germplasm keeps the focus where it is (the conservation type)
      if (first && !this.isNew) {
        // Focused, without opening a list
        this.focusField(first.editKey, false)
      }
    },
    // Back to the saved values (the fields are filled again from them the next time editing starts). With changes it asks
    // first, like leaving the page.
    cancelEditing: function () {
      this.confirmLeave('Do you really want to discard them?', false).then(discard => {
        if (discard) {
          this.stopEditing()
        }
      })
    },
    stopEditing: function () {
      this.tagMenuOpen = null
      this.isEditing = false
      this.editCommitted = false
      this.touchedFields = []
    },
    commitEdit: function (key) {
      if (key && !this.touchedFields.includes(key)) {
        this.touchedFields.push(key)
      }
      this.editCommitted = true
    },
    // Red field and hint once a changed field was left empty
    // Why the edited value can't be saved, null when it can
    getEditError: function (key) {
      if (this.edit[key].trim() === '') {
        return 'Field cannot be empty'
      }
      if (this.isMultiCodedField(key) && splitCodes(this.edit[key]).some(part => !findCode(key, part))) {
        return 'Remove the values that are not in the list'
      }
      if (this.isCountryField(key) && !this.findCountry(this.edit[key])) {
        return 'Choose one of the countries of the list'
      }
      if (this.isCodedField(key) && !findCode(key, this.edit[key])) {
        return 'Choose one of the values of the list'
      }
      if (key === 'subtaxa' && !parseSubtaxa(this.edit.subtaxa)) {
        return this.subtaxaRank ? 'Type the name after the abbreviation' : 'Choose one of the abbreviations: subsp., convar., var., f. or Group'
      }
      return null
    },
    // Red field and hint once a changed field was left with a value that can't be saved
    getEditState: function (key) {
      return this.touchedFields.includes(key) && this.changedFields.includes(key) && this.getEditError(key) ? false : null
    },
    clearField: function (key) {
      this.edit[key] = ''
      if (this.isMultiCodedField(key)) {
        this.setTags(key, [])
        this.tagMenuOpen = null
      }
      if (key === 'subtaxa') {
        this.subtaxaRank = null
        this.subtaxaName = ''
      }
      this.focusField(key)
    },
    // SUBTAXA as edited: "<abbreviation> <name>"
    updateEditedSubtaxa: function () {
      if (this.isEditing) {
        const name = this.subtaxaName.trim()
        this.edit.subtaxa = this.subtaxaRank && name ? `${this.subtaxaRank} ${name}` : (this.subtaxaRank || name)
      }
    },
    onEditButtonClick: function () {
      if (!this.isEditing) {
        this.startEditing()
      } else if (!this.hasUnsavedChanges) {
        // Nothing changed: leave the edit mode
        this.stopEditing()
      } else if (!this.editCommitted) {
        // Changed but still in the field: confirm it first, like leaving the field
        this.commitEdit()
      } else if (this.editIsValid) {
        this.saveChanges()
      }
    },
    saveChanges: function () {
      // Only the changed fields are sent
      const changes = this.changedFields.reduce((values, key) => ({ ...values, [key]: this.getValueToSave(key) }), {})

      this.savingGermplasm = true
      this.savePhase = 'validating'

      updateGermplasmMcpd(this.germplasm, this.mcpd, changes, this.storeServerSettings.dataImportMode, phase => { this.savePhase = phase })
        .then(() => {
          this.stopEditing()
          this.loadMcpd()
          // The accession name also changes the display name and the synonyms of the germplasm
          this.refreshGermplasmRow()
          this.loadAttributes()
          // A new value is suggested next time
          clearMcpdSuggestions()
          emitter.emit('toast', {
            message: 'The changes to the germplasm were saved.',
            title: 'Changes saved',
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })
        })
        .catch(error => {
          emitter.emit('toast', {
            message: `The changes could not be saved. ${error.message}`,
            title: 'Changes not saved',
            variant: 'danger',
            noAutoHide: true,
            appendToast: true
          })
        })
        .finally(() => {
          this.savingGermplasm = false
        })
    },
    // Asks before leaving the page with changes that were not saved. Resolves with true to leave.
    // includeInstitutions: also the changes to the institutions (leaving the page), not only those of the passport
    confirmLeave: function (question = 'Do you really want to leave this page?', includeInstitutions = true) {
      if (!this.hasUnsavedChanges && !(includeInstitutions && this.hasInstitutionChanges) && !this.hasNewGermplasmData && !this.hasMetadataChanges && !this.hasNewMetadata) {
        return Promise.resolve(true)
      }

      return this.$bvModal.msgBoxConfirm(`You have changes that were not saved. ${question}`, {
        title: 'Unsaved changes',
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      }).then(value => !!value)
    },
    // Closing or reloading the tab: browsers only allow their own question there
    onBeforeUnload: function (event) {
      if (this.hasUnsavedChanges || this.hasInstitutionChanges || this.hasNewGermplasmData || this.hasMetadataChanges || this.hasNewMetadata) {
        event.preventDefault()
        event.returnValue = ''
      }
    },
    toggle: function (panel) {
      this.open[panel] = !this.open[panel]

      // Leaflet has to re-measure a map that was hidden
      if (panel === 'location' && this.open.location && this.$refs.map) {
        this.$refs.map.invalidateSize()
      }
    },
    getWiewsOrganisationUrl,
    // "2026 · CABI Agriculture and Bioscience"
    getPublicationMeta: function (publication) {
      return [publication.year, publication.source].filter(v => v).join(' · ')
    },
    deletePublicationReference: function (publication) {
      this.$bvModal.msgBoxConfirm(this.$t('modalTitleSure'), {
        okVariant: 'danger',
        okTitle: this.$t('genericYes'),
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            apiDeletePublicationReference(publication.id, 'germplasm', this.germplasm.germplasmId, () => {
              this.loadPublications()
              // Germinate removes a publication left without any link, which changes the sidebar count
              emitter.emit('update-sidebar-menu')
            })
          }
        })
    },
    onPublicationAdded: function () {
      this.loadPublications()
      emitter.emit('update-sidebar-menu')
    },
    loadGroups: function () {
      apiPostGermplasmGroupTable(this.germplasm.germplasmId, { page: 1, limit: MAX_JAVA_INTEGER }, result => {
        this.groups = (result && result.data) ? result.data : []
      })
    },
    // All attributes of the "Additional attributes" of the original passport page: the Metadata tab shows them all,
    // the rules in PAGE_ATTRIBUTES use some of them
    loadAttributes: function () {
      const query = {
        page: 1,
        limit: MAX_JAVA_INTEGER,
        filter: [{
          column: 'germplasmId',
          comparator: 'equals',
          operator: 'and',
          values: [this.germplasm.germplasmId]
        }]
      }

      apiPostGermplasmAttributeTable(query, result => {
        const attributes = (result && result.data) ? result.data : []
        this.attributes = attributes

        // Exact names only
        const values = {}
        attributes
          .filter(a => PAGE_ATTRIBUTES.includes(a.attributeName) && a.attributeValue !== null && a.attributeValue !== undefined)
          .forEach(a => {
            values[a.attributeName] = [...(values[a.attributeName] || []), a.attributeValue]
          })
        this.attributeValues = values

        const inSitu = attributes.find(a => a.attributeName === 'IN-SITU')
        this.inSituValue = inSitu ? inSitu.attributeValue : null

        // A value can hold several codes ("DEU146; GBR001"), each one becomes an institution
        this.liaisonCodes = attributes
          .filter(a => a.attributeName === 'LIAISONCODE' && a.attributeValue)
          .flatMap(a => `${a.attributeValue}`.split(/[;,]/))
          .map(code => code.trim())
          .filter((code, index, codes) => code && codes.indexOf(code) === index)

        this.lookUpMissingNames()
      })
    },
    getReferenceImageSrc: function (image) {
      return getImageUrl(image.imagePath, {
        name: image.imagePath,
        token: this.storeToken ? this.storeToken.imageToken : null,
        type: 'database',
        size: 'large'
      })
    },
    loadReferenceImages: function () {
      if (!this.germplasm) {
        return
      }

      const filter = [{
        column: 'imageForeignId',
        comparator: 'equals',
        operator: 'and',
        values: [this.germplasm.germplasmId]
      }, {
        column: 'imageRefTable',
        comparator: 'equals',
        operator: 'and',
        values: ['germinatebase']
      }, {
        column: 'imageIsReference',
        comparator: 'equals',
        operator: 'and',
        values: [1]
      }]

      apiPostImages({ page: 1, limit: MAX_JAVA_INTEGER, orderBy: 'createdOn', ascending: 0, filter: filter }, result => {
        this.referenceImages = ((result && result.data) || []).filter(i => i.imageIsReference)
        this.referenceImageIndex = 0
        this.startReferenceImageTimer()
      })
    },
    // Only runs with more than one reference image
    startReferenceImageTimer: function () {
      this.stopReferenceImageTimer()

      if (this.referenceImages.length > 1) {
        this.referenceImageTimer = setInterval(() => {
          this.referenceImageIndex = (this.referenceImageIndex + 1) % this.referenceImages.length
        }, REFERENCE_IMAGE_INTERVAL)
      }
    },
    stopReferenceImageTimer: function () {
      if (this.referenceImageTimer) {
        clearInterval(this.referenceImageTimer)
        this.referenceImageTimer = null
      }
    },
    // Same data as the trait performance section of the original passport page, here only to know whether to show the tab
    loadTraitStatsCount: function () {
      apiGetGermplasmStatsTraits(this.germplasm.germplasmId, result => {
        this.traitStatsCount = Array.isArray(result) ? result.length : 0
      })
    },
    // Administrators can read the "PDCI calculation" setting itself
    loadPdciSetting: function () {
      if (!this.storeToken || !userIsAtLeast(this.storeToken.userType, USER_TYPE_ADMINISTRATOR)) {
        return
      }

      apiGetAdminSettings(result => {
        if (result && typeof result.pdciEnabled === 'boolean') {
          this.adminPdciEnabled = result.pdciEnabled
        }
      }, { codes: [], callback: () => {} })
    },
    // Reloads the row of the germplasm table, without reloading the rest of the page
    refreshGermplasmRow: function () {
      if (!this.germplasm) {
        return
      }

      const filter = [{ column: 'germplasmId', comparator: 'equals', operator: 'and', values: [this.germplasm.germplasmId] }]
      apiPostGermplasmTable({ page: 1, limit: 1, filter: filter }, result => {
        if (result && result.data && result.data.length > 0) {
          this.germplasm = result.data[0]
        }
      })
    },
    loadMcpd: function () {
      if (!this.germplasm) {
        return
      }

      apiGetGermplasmMcpd(this.germplasm.germplasmId, result => {
        this.mcpd = result || null
      })
    },
    toggleMarked: function () {
      if (!this.germplasm) {
        return
      }

      const payload = { type: 'germplasm', ids: [this.germplasm.germplasmId] }
      this.$store.dispatch(this.isMarked ? 'removeMarkedIds' : 'addMarkedIds', payload)
    },
    getEntityData: function (data, callback) {
      return apiPostEntityTable(data, callback)
    },
    getEntityLevelStyle: function (level) {
      const color = level.type.color() || '#6b6f6c'
      return { background: color, color: getHighContrastTextColor(color) }
    },
    startMapSelection: function () {
      this.pendingLocation = null
      this.mapCoordinates = { latitude: '', longitude: '' }
      this.isSelectingOnMap = true
    },
    // A coordinate typed: a decimal number (a comma counts as the decimal point), null when it isn't one
    parseCoordinate: function (value) {
      const text = `${value === null || value === undefined ? '' : value}`.trim().replace(',', '.')
      return /^[-+]?\d+(\.\d+)?$/.test(text) ? Number(text) : null
    },
    getCoordinateError: function (axis) {
      const text = `${this.mapCoordinates[axis] || ''}`.trim()
      if (text === '') {
        return null
      }
      const value = this.parseCoordinate(text)
      const limit = axis === 'latitude' ? 90 : 180
      if (value === null) {
        return 'A decimal number, e.g. ' + (axis === 'latitude' ? '51.8236' : '11.2878')
      }
      return Math.abs(value) > limit ? `Between -${limit} and ${limit}` : null
    },
    getCoordinateState: function (axis) {
      return this.getCoordinateError(axis) ? false : null
    },
    // Both coordinates valid: the pin goes there (after a short pause in typing)
    onCoordinatesTyped: function () {
      clearTimeout(this.coordinatesTimer)
      const latitude = this.parseCoordinate(this.mapCoordinates.latitude)
      const longitude = this.parseCoordinate(this.mapCoordinates.longitude)
      if (latitude === null || longitude === null || this.getCoordinateError('latitude') || this.getCoordinateError('longitude')) {
        return
      }
      // Already where the pin is (it was placed on the map)
      if (this.mapPoint && this.mapPoint.latitude === latitude && this.mapPoint.longitude === longitude) {
        return
      }
      this.coordinatesTimer = setTimeout(() => {
        if (this.$refs.expandedMap) {
          this.mapPoint = { latitude, longitude }
          this.$refs.expandedMap.placePoint(latitude, longitude)
        }
      }, MAP_COORDINATES_DELAY)
    },
    // A pin placed on the map: its coordinates in the fields
    onMapPointPlaced: function (point) {
      const latitude = Number(point.latitude.toFixed(6))
      const longitude = Number(point.longitude.toFixed(6))
      this.mapPoint = { latitude, longitude }
      this.mapCoordinates = { latitude: `${latitude}`, longitude: `${longitude}` }
    },
    stopMapSelection: function () {
      this.pendingLocation = null
      this.isSelectingOnMap = false
    },
    // Leaflet measures the map once the unfold transition is over, then the block is brought into view
    onExpandedMapShown: function () {
      if (this.$refs.expandedMap) {
        this.$refs.expandedMap.invalidateSize()
      }
      if (this.$refs.expandedLocation) {
        this.$refs.expandedLocation.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    },
    // Reloads the germplasm row after its location changed, the map follows from it
    reloadGermplasmRow: function () {
      const query = {
        page: 1,
        limit: 1,
        filter: [{
          column: 'germplasmId',
          comparator: 'equals',
          operator: 'and',
          values: [this.germplasm.germplasmId]
        }]
      }

      apiPostGermplasmTable(query, result => {
        if (result && result.data && result.data.length > 0) {
          this.germplasm = result.data[0]
        }
      })
    },
    // "Select existing": same as the original page, the germplasm gets the chosen location
    onExistingLocationSelected: function (locationId) {
      // A new germplasm: only remembered (with what the map needs to show it)
      if (this.isNew) {
        apiPostLocationTable({ page: 1, limit: 1, filter: [{ column: 'locationId', comparator: 'equals', operator: 'and', values: [locationId] }] }, result => {
          const location = result && result.data && result.data[0]
          if (location) {
            this.newLocation = { request: { id: locationId }, location: { ...location, locationType: location.locationType || 'collectingsites' } }
          }
        })
        return
      }
      apiPatchGermplasmLocation(this.germplasm.germplasmId, { id: locationId }, () => this.reloadGermplasmRow())
    },
    // "Select on map": the point confirmed in the map marker is named (country, site, elevation) before saving
    onMapLocationSelected: function (location) {
      if (location) {
        this.pendingLocation = location
        this.$refs.locationCountrySelectionModal.show()
      }
    },
    onNewLocationNamed: function (input) {
      if (!input || !this.pendingLocation) {
        return
      }

      // A new germplasm: only remembered, the location is created with the germplasm
      if (this.isNew) {
        const country = this.editCountries.find(c => c.id === input.countryId)
        this.newLocation = {
          request: {
            id: null,
            countryId: input.countryId,
            siteName: input.name,
            elevation: input.elevation,
            latitude: this.pendingLocation.locationLatitude,
            longitude: this.pendingLocation.locationLongitude,
            locationtypeId: 1
          },
          location: {
            locationId: -1,
            locationName: input.name,
            locationLatitude: this.pendingLocation.locationLatitude,
            locationLongitude: this.pendingLocation.locationLongitude,
            locationElevation: input.elevation,
            locationType: 'collectingsites',
            countryName: country ? country.countryName : null,
            countryCode2: country ? country.countryCode2 : null,
            countryCode3: country ? country.countryCode3 : null
          }
        }
        this.stopMapSelection()
        return
      }

      apiPatchGermplasmLocation(this.germplasm.germplasmId, {
        id: null,
        countryId: input.countryId,
        siteName: input.name,
        elevation: input.elevation,
        latitude: this.pendingLocation.locationLatitude,
        longitude: this.pendingLocation.locationLongitude,
        locationtypeId: 1
      }, () => {
        this.reloadGermplasmRow()
        this.stopMapSelection()
      })
    },
    getPedigreeData: function (data, callback) {
      return apiPostPedigreeTable(data, callback)
    },
    getPedigreeDefinitionData: function (data, callback) {
      return apiPostPedigreedefinitionTable(data, callback)
    },
    addPublication: function () {
      this.$refs.addPublicationModal.show()
    },
    loadPublications: function () {
      if (!this.germplasm) {
        return
      }

      apiGetPublications('germplasm', this.germplasm.germplasmId, result => {
        this.publications = (result || []).map(toPassportPublication)
        this.publicationPage = Math.min(this.publicationPage, Math.max(1, this.publicationPageCount))
      })
    },
    addDataset: function () {
      this.$refs.datasetEditModal.show()
    },
    // A new germplasm: shows the other institution types, or hides them again (their codes are dropped)
    toggleNewOtherInstitutions: function () {
      const keys = MCPD_INSTITUTION_TYPES.concat(IN_SITU_INSTITUTION_TYPES).map(entry => `new-${entry.type}`)
      const edit = { ...this.institutionEdit }
      const original = { ...this.institutionOriginal }
      const lookups = { ...this.institutionLookup }
      keys.forEach(key => {
        delete lookups[key]
        if (this.newOtherInstitutions) {
          delete edit[key]
          delete original[key]
        } else {
          edit[key] = ''
          original[key] = ''
        }
      })
      this.institutionEdit = edit
      this.institutionOriginal = original
      this.institutionLookup = lookups
      this.institutionTouched = this.institutionTouched.filter(key => !keys.includes(key))
      this.newOtherInstitutions = !this.newOtherInstitutions
      this.open.institutions = true
    },
    toggleInstitutionEditing: function () {
      if (this.isEditingInstitutions) {
        this.isEditingInstitutions = false
        return
      }

      // Only the missing types can be filled in (the institutions already linked can't be changed)
      const codes = {}
      this.missingInstitutionTypes.forEach(entry => {
        codes[`new-${entry.type}`] = ''
      })
      this.institutionOriginal = codes
      this.institutionEdit = { ...codes }
      this.institutionTouched = []
      this.institutionLookup = {}
      this.isEditingInstitutions = true
      this.open.institutions = true
    },
    // With changes it asks first, like leaving the page
    cancelInstitutionEditing: function () {
      const discard = this.hasInstitutionChanges
        ? this.$bvModal.msgBoxConfirm('You have changes that were not saved. Do you really want to discard them?', {
          title: 'Unsaved changes',
          okVariant: 'danger',
          okTitle: this.$t('genericYes'),
          cancelTitle: this.$t('genericNo')
        })
        : Promise.resolve(true)

      discard.then(value => {
        if (value) {
          this.isEditingInstitutions = false
        }
      })
    },
    // Adds the institutions typed for the missing types, with the name and address found on FAO WIEWS, through the MCPD
    // import (COLLCODE/COLLNAME/COLLINSTADDRESS, BREDCODE/BREDNAME, DONORCODE/DONORNAME, DUPLSITE/DUPLINSTNAME).
    // Changing an existing institution isn't possible (the import would add the new one and keep the old one), so they
    // are disabled while editing.
    saveInstitutionChanges: function () {
      const changes = {}
      this.missingInstitutionTypes.forEach(entry => {
        const key = `new-${entry.type}`
        const lookup = this.institutionLookup[key]
        const code = this.institutionEdit[key]
        if (!code || !lookup || lookup.status !== 'found' || lookup.code !== code) {
          return
        }
        changes[entry.codeField] = code
        if (lookup.name) {
          changes[entry.nameField] = lookup.name.substring(0, 255)
        }
        if (entry.addressField && lookup.address) {
          changes[entry.addressField] = lookup.address
        }
      })
      if (Object.keys(changes).length === 0) {
        return
      }

      this.savingInstitutions = true
      updateGermplasmMcpd(this.germplasm, this.mcpd, changes, this.storeServerSettings.dataImportMode, phase => { this.institutionSavePhase = phase })
        .then(() => {
          this.isEditingInstitutions = false
          this.loadInstitutions()
          this.loadMcpd()
          // The liaison institution of in-situ populations comes from the attributes
          this.loadAttributes()
          emitter.emit('toast', {
            message: 'The institutions were added to the germplasm.',
            title: 'Changes saved',
            variant: 'success',
            autoHideDelay: 5000,
            appendToast: true
          })
        })
        .catch(error => {
          emitter.emit('toast', {
            message: `The changes could not be saved. ${error.message}`,
            title: 'Changes not saved',
            variant: 'danger',
            noAutoHide: true,
            appendToast: true
          })
        })
        .finally(() => {
          this.savingInstitutions = false
          this.institutionSavePhase = null
        })
    },
    // Institute code mask: 3 letters (upper case), then 3 digits
    setInstitutionCode: function (key, value) {
      const code = `${value || ''}`.toUpperCase().split('').reduce((result, char) => {
        if (result.length < 3 && /[A-Z]/.test(char)) {
          return result + char
        }
        if (result.length >= 3 && result.length < 6 && /[0-9]/.test(char)) {
          return result + char
        }
        return result
      }, '')
      this.institutionEdit = { ...this.institutionEdit, [key]: code }
      // The FAO WIEWS result of another code doesn't apply any more
      if (this.institutionLookup[key] && this.institutionLookup[key].code !== code) {
        const lookups = { ...this.institutionLookup }
        delete lookups[key]
        this.institutionLookup = lookups
      }
      // Looked up as soon as the 6 characters are there (leaving the field also does it)
      if (INSTITUTE_CODE_PATTERN.test(code)) {
        this.touchInstitutionCode(key)
      }
    },
    touchInstitutionCode: function (key) {
      if (!this.institutionTouched.includes(key)) {
        this.institutionTouched.push(key)
      }
      this.lookupInstitutionCode(key)
    },
    // A complete, changed code is looked up on FAO WIEWS: found, its name and address are shown; not found (or the
    // service can't be reached), the field goes back to the code it had (an existing institution) or empty (a new one)
    lookupInstitutionCode: function (key) {
      const code = this.institutionEdit[key] || ''
      const lookups = { ...this.institutionLookup }

      if (!INSTITUTE_CODE_PATTERN.test(code) || code === this.institutionOriginal[key]) {
        delete lookups[key]
        this.institutionLookup = lookups
        return
      }
      if (lookups[key] && lookups[key].code === code && lookups[key].status !== 'notfound') {
        return
      }

      this.institutionLookup = { ...lookups, [key]: { status: 'loading', code } }

      getWiewsOrganizations(code).then(results => {
        // Changed again while looking up: that one counts
        if (!this.isEditingInstitutions || this.institutionEdit[key] !== code) {
          return
        }
        const result = results && results[0]
        if (result && result.success) {
          const place = [result.zip_code, result.city].filter(v => v).join(' ')
          const address = [result.address, place, result.country].filter(v => v).join(', ')
          this.institutionLookup = { ...this.institutionLookup, [key]: { status: 'found', code, name: result.name_of_organization || code, address } }
        } else {
          const notFound = result && result.error_message && result.error_message.startsWith('No organization found')
          this.institutionEdit = { ...this.institutionEdit, [key]: this.institutionOriginal[key] }
          this.institutionTouched = this.institutionTouched.filter(k => k !== key)
          this.institutionLookup = {
            ...this.institutionLookup,
            [key]: {
              status: 'notfound',
              code,
              message: notFound ? `${code} was not found on FAO WIEWS, it was not used.` : `${code} could not be checked on FAO WIEWS, it was not used.`
            }
          }
        }
      })
    },
    // Why the code of a row can't be saved, null when it can. A missing type can stay empty (nothing to add), an
    // existing institution can't be emptied (the import can't remove a value).
    getInstitutionCodeError: function (key) {
      const code = this.institutionEdit[key] || ''
      if (code === '') {
        // The maintenance institution of a new germplasm is mandatory
        return key.startsWith('new-') && !(this.isNew && key === NEW_MAINTENANCE_KEY) ? null : 'Field cannot be empty'
      }
      return INSTITUTE_CODE_PATTERN.test(code) ? null : '3-letter country code and 3 digits, e.g. DEU146'
    },
    // Red once left with a code that can't be saved, green for a changed valid one
    getInstitutionCodeState: function (key) {
      // Left empty: red, even if it was empty before
      if (this.isNew && key === NEW_MAINTENANCE_KEY && this.institutionTouched.includes(key) && !this.institutionEdit[key]) {
        return false
      }
      if (!this.institutionTouched.includes(key) || this.institutionEdit[key] === this.institutionOriginal[key]) {
        return null
      }
      return this.getInstitutionCodeError(key) ? false : (this.institutionEdit[key] ? true : null)
    },
    getInstitutionType: function (institution) {
      if (institution.institutionType === LIAISON_INSTITUTION_TYPE_KEY) {
        return LIAISON_INSTITUTION_TYPE
      }
      return germplasmInstitutionTypes[institution.institutionType] || UNKNOWN_DATASET_TYPE
    },
    // Icon background follows the institution type colour, the icon colour is picked for contrast
    getInstitutionTypeStyle: function (institution) {
      const color = this.getInstitutionType(institution).color() || '#6b6f6c'
      return { background: color, color: getHighContrastTextColor(color) }
    },
    // The Germinate name, or else the FAO WIEWS name, or else "N/A"
    getInstitutionName: function (institution) {
      if (!isMissingName(institution.institutionName)) {
        return institution.institutionName
      }

      const code = institution.institutionCode ? institution.institutionCode.toUpperCase() : null
      const found = code ? this.wiewsNames[code] : null

      if (found === undefined) {
        return '…'
      }

      return found || 'N/A'
    },
    lookUpMissingNames: function () {
      this.institutions
        .filter(i => isMissingName(i.institutionName) && i.institutionCode)
        .map(i => i.institutionCode.toUpperCase())
        .filter((code, index, codes) => codes.indexOf(code) === index && !(code in this.wiewsNames))
        .forEach(code => {
          this.$set(this.wiewsNames, code, undefined)
          getWiewsInstitutionName(code).then(name => {
            this.wiewsNames[code] = name
          })
        })
    },
    // All institutions are loaded so maintenance ones can come first across pages, then shown 4 at a time
    loadInstitutions: function () {
      if (!this.germplasm) {
        return
      }

      apiPostGermplasmInstitutionTable(this.germplasm.germplasmId, { page: 1, limit: MAX_JAVA_INTEGER }, result => {
        this.germplasmInstitutions = sortInstitutions((result && result.data) ? result.data : [])
        this.lookUpMissingNames()
      })
    },
    getDatasetType: function (dataset) {
      return datasetTypes[dataset.datasetType] || UNKNOWN_DATASET_TYPE
    },
    // Icon background follows the dataset type colour, the icon colour is picked for contrast
    getDatasetTypeStyle: function (dataset) {
      const color = this.getDatasetType(dataset).color() || '#6b6f6c'
      return { background: color, color: getHighContrastTextColor(color) }
    },
    // Same check as the datasets table: has the current user (or the anonymous user) accepted the licence
    isLicenseAccepted: function (dataset) {
      const userId = this.storeToken ? this.storeToken.id : -1000
      return !!dataset.acceptedBy && dataset.acceptedBy.indexOf(userId) !== -1
    },
    // Same rules as the dataset name in the datasets table: external hyperlink, else the page of the dataset type, else no link
    getDatasetLink: function (dataset) {
      const type = this.getDatasetType(dataset)

      if (dataset.hyperlink && dataset.isExternal) {
        return { tag: 'a', attributes: { href: dataset.hyperlink, target: '_blank', rel: 'noopener noreferrer' } }
      }

      if (!dataset.isExternal && type.pageName && isPageAvailable(dataset.datasetType) && (!dataset.licenseName || this.isLicenseAccepted(dataset))) {
        return { tag: 'router-link', attributes: { to: { name: type.pageName, params: { datasetIds: dataset.datasetId.toString() } } } }
      }

      return { tag: 'div', attributes: {} }
    },
    loadDatasets: function (page) {
      if (!this.germplasm) {
        return
      }

      const query = {
        page: page,
        limit: DATASETS_PER_PAGE,
        prevCount: -1,
        orderBy: 'datasetName',
        ascending: 1
      }

      apiPostGermplasmDatasetTable(this.germplasm.germplasmId, query, result => {
        this.datasets = (result && result.data) ? result.data : []
        this.datasetTotal = (result && result.count) || 0
        this.datasetPage = page
      })
    },
    // Like the original passport page: the URL holds the germplasm id, or else its name, display name or PUID
    loadGermplasm: function () {
      const param = this.germplasmId !== null && this.germplasmId !== undefined ? this.germplasmId : this.$route.params.germplasmId
      let filter

      if (param === undefined || param === null || param === '') {
        return
      }

      if (isNaN(param)) {
        filter = ['germplasmName', 'germplasmDisplayName', 'germplasmPuid'].map(column => ({
          column: column,
          comparator: 'equals',
          operator: 'or',
          values: [param]
        }))
      } else {
        filter = [{
          column: 'germplasmId',
          comparator: 'equals',
          operator: 'and',
          values: [parseInt(param)]
        }]
      }

      apiPostGermplasmTable({ page: 1, limit: 1, filter: filter }, result => {
        this.germplasm = (result && result.data && result.data.length > 0) ? result.data[0] : null
        // Recorded as recently viewed, like on the original passport page
        if (this.germplasm) {
          this.$store.dispatch('pushRecentIds', { type: 'germplasm', id: this.germplasm.germplasmId })
        }
        this.loadMcpd()
        this.loadGroups()
        this.loadAttributes()
        this.loadReferenceImages()
        this.loadTraitStatsCount()
        this.loadDatasets(1)
        this.loadInstitutions()
        this.loadPublications()
      })
    }
  },
  beforeRouteLeave: function (to, from, next) {
    this.confirmLeave().then(leave => next(leave))
  },
  // Another germplasm on the same page
  beforeRouteUpdate: function (to, from, next) {
    this.confirmLeave().then(leave => next(leave))
  },
  beforeDestroy: function () {
    this.stopReferenceImageTimer()
    this.removeDocumentPointerListener()
    clearTimeout(this.accenumbCheckTimer)
    clearTimeout(this.coordinatesTimer)
    window.removeEventListener('beforeunload', this.onBeforeUnload)
  },
  mounted: function () {
    window.addEventListener('beforeunload', this.onBeforeUnload)
    if (this.isNew) {
      // An empty passport: no germplasm, no attributes. The conservation type is the one chosen (none yet).
      this.mcpd = {}
      this.inSituValue = undefined
      // The institutions are filled in from the start
      this.toggleInstitutionEditing()
      // The predefined metadata (see newMetadataFields), empty
      this.metadataEdit = Object.keys(METADATA_RULES).reduce((values, code) => ({ ...values, [code]: '' }), {})
      this.loadNewAllValues()
      this.loadNewGroups()
      // Countries of a location placed on the map
      this.loadCountries()
      return
    }
    this.loadPdciSetting()
    this.loadGermplasm()
  }
}
</script>

<style src="@/assets/custom-page.css"></style>

<style scoped>
.passport-page {
  /* Colours only used on this page, with their dark mode version below */
  --pp-code: #6a9a3c;
  --pp-mark: #000000;
  --pp-header-veil: rgba(255, 255, 255, 0.72);
  --pp-header-button: rgba(255, 255, 255, 0.85);
  --pp-barcode: #2c7da0;
  --pp-barcode-icon: #000000;

  /* Same content width as the home page */
  max-width: 1488px;
  margin: 0 auto;
  padding: 0.5rem 0 3rem;
}
/* Add Germplasm: the whole width of the modal */
.passport-page.is-new {
  max-width: none;
  padding: 0 0 1rem;
}
body.dark-mode .passport-page {
  --pp-code: #9fd18f;
  /* Black would not be visible on the dark background */
  --pp-mark: #e8e6e3;
  --pp-header-veil: rgba(31, 34, 35, 0.78);
  --pp-header-button: rgba(31, 34, 35, 0.85);
  --pp-barcode: #7cc4e0;
  /* Black would not be visible on the dark background */
  --pp-barcode-icon: #e8e6e3;
}

.pp-card {
  background: var(--cp-surface);
  border: 1px solid var(--cp-border);
  border-radius: 12px;
}

/* Header */
.pp-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.75rem 2rem;
}
/* Takes the free space so a long accession name gets cut instead of pushing the buttons down */
.pp-header-main {
  flex: 1 1 320px;
  min-width: 0;
}

/* Reference images behind the header: blurred, with a veil in the card colour so the text stays readable */
.pp-header {
  position: relative;
  overflow: hidden;
}
.pp-header > .pp-header-main,
.pp-header > .pp-header-actions {
  position: relative;
  z-index: 1;
}
.pp-header-backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.pp-header-image {
  position: absolute;
  /* Larger than the header so the blurred edges stay outside of it */
  inset: -24px;
  background-position: center;
  background-size: cover;
  filter: blur(8px);
  opacity: 0;
  transition: opacity 2s ease-in-out;
}
.pp-header-image.active {
  opacity: 1;
}
.pp-header-veil {
  position: absolute;
  inset: 0;
  background: var(--pp-header-veil);
}
/* The buttons get a bit of the veil too, so they stand out on the image */
.pp-header-has-image .pp-action-button:not(.marked) {
  background: var(--pp-header-button);
}
@media (prefers-reduced-motion: reduce) {
  .pp-header-image {
    transition: none;
  }
}
.pp-header-crop {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.pp-crop-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
}
.pp-crop-name {
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--cp-muted);
}
.pp-status-badge {
  font-style: italic;
  padding: 0.05rem 0.7rem;
  border: 1px solid var(--cp-green);
  border-radius: 6px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
  font-size: 0.85rem;
}
.pp-title {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  min-width: 0;
  margin: 0.9rem 0 0.25rem;
  font-size: 2.2rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
.pp-title-main {
  flex-shrink: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-title-secondary {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 1.15rem;
  font-weight: 400;
  color: var(--cp-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-taxonomy {
  font-size: 1.1rem;
  font-style: italic;
  color: var(--cp-muted);
}

.pp-header-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  min-width: 260px;
}
.pp-action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1rem;
  border: 1px solid var(--cp-border);
  border-radius: 10px;
  background: var(--cp-surface);
  color: var(--cp-text);
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.pp-action-button:hover {
  color: var(--cp-text);
  text-decoration: none;
  background: var(--cp-surface-hover);
  border-color: var(--cp-green);
}
.pp-action-icon {
  display: inline-flex;
}
.pp-action-mark {
  color: var(--pp-mark);
}
/* Marked: green, like the active "Search within" chip on the home page */
.pp-action-button.marked,
.pp-action-button.marked:hover {
  border-color: var(--cp-green);
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.pp-action-button.marked .pp-action-mark {
  color: var(--cp-green);
}
.pp-action-button:disabled {
  opacity: 0.6;
  cursor: default;
}
.pp-action-barcode {
  color: var(--pp-barcode-icon);
}
.pp-pdci {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-top: 0.25rem;
}
.pp-pdci-bar {
  flex: 1;
  height: 12px;
  border-radius: 4px;
  background: var(--cp-neutral-bg);
  overflow: hidden;
}
.pp-pdci-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  background: var(--cp-green);
}
.pp-pdci-text {
  font-weight: 600;
  white-space: nowrap;
}
.pp-info {
  display: inline-flex;
  color: var(--cp-muted);
  cursor: help;
}
.pp-info-button {
  padding: 0;
  border: none;
  background: transparent;
}
.pp-info-button:hover,
.pp-info-button:focus-visible {
  color: var(--pp-code);
}

/* Tabs (Bootstrap), in the look of the custom pages. No scrolling: the tabs wrap when there is no room. */
.pp-tabs {
  margin-top: 1.5rem;
}
.pp-tabs >>> .pp-tabs-nav {
  flex-wrap: wrap;
  border-bottom: 1px solid var(--cp-border);
}
.pp-tabs >>> .pp-tabs-nav .nav-link {
  padding: 0.7rem 1.25rem;
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;
  color: var(--cp-muted);
  font-weight: 600;
}
.pp-tabs >>> .pp-tabs-nav .nav-link:hover,
.pp-tabs >>> .pp-tabs-nav .nav-link:focus {
  border-color: transparent;
  color: var(--cp-text);
}
.pp-tabs >>> .pp-tabs-nav .nav-link.active {
  border-color: var(--cp-border) var(--cp-border) var(--cp-surface);
  background: var(--cp-surface);
  color: var(--cp-text);
}
.pp-tab-panel {
  margin-top: 1.25rem;
}
/* Text that explains a tab, like the section texts of the original passport page */
.pp-tab-intro {
  margin: 0 0 1.25rem;
  line-height: 1.6;
  color: var(--cp-muted);
}
.pp-tab-card {
  min-width: 0;
  margin-bottom: 1.5rem;
  padding: 1.25rem 1.5rem;
}
.pp-tab-card-title {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
}
/* Wide tables and charts scroll inside their card, the page itself does not */
.pp-scroll {
  max-width: 100%;
  overflow-x: auto;
}
/* The trait performance component brings its own card, here it sits inside ours */
.pp-trait-stats >>> .card {
  border: none;
  background: transparent;
}
.pp-trait-stats >>> .card-body {
  padding: 0;
}
/* The traits come in a Bootstrap row, whose negative margins made the card scroll sideways.
   Here they form a grid that wraps onto as many rows as needed. */
.pp-trait-stats >>> .card-body > div > .row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin: 0 0 1rem;
}
.pp-trait-stats >>> .card-body > div > .row > [class*="col"] {
  max-width: none;
  padding: 0;
}

/* Entity hierarchy */
.pp-entity-levels {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1.5rem;
  padding: 0;
  list-style: none;
}
.pp-entity-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--cp-muted);
}
.pp-entity-level > span:last-child {
  padding: 0.3rem 0.8rem 0.3rem 0;
}
.pp-entity-level.current > span:last-child {
  color: var(--cp-text);
  font-weight: 600;
}
.pp-entity-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  opacity: 0.55;
}
.pp-entity-level.current .pp-entity-icon {
  opacity: 1;
  box-shadow: 0 0 0 3px var(--cp-green-soft);
}

/* The chart component has no content without pedigree datasets: hide the empty card */
.pp-pedigree-chart:not(:has(.pedigree-chart, select)) {
  display: none;
}
.pp-pedigree-chart >>> h4 {
  margin: 0 0 0.75rem;
  font-size: 1.05rem;
  font-weight: 600;
}
.pp-tab-empty {
  margin: 1.5rem 0;
  color: var(--cp-muted);
}

/* Passport tab: overview on the left, the other panels on the right */
.pp-tab-content {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 1.75rem;
  align-items: start;
  margin-top: 1.25rem;
}
.pp-main {
  min-width: 0;
}
/* CONSERVATION of a new germplasm: like the filter of the germplasm list, the chosen option filled in green */
.pp-conservation-buttons .btn {
  min-width: 4.5rem;
}
.pp-conservation-buttons .btn.selected,
.pp-conservation-buttons .btn.selected:hover {
  border-color: #3b6b35;
  background: #3b6b35;
  color: #ffffff;
  font-weight: 600;
  font-style: italic;
}
/* Under the Overview, with room below so it doesn't touch the footer */
.pp-standard-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.75rem 0 1.5rem;
  font-size: 0.9rem;
  color: var(--cp-muted);
}
.pp-standard-link {
  display: inline-flex;
  color: var(--cp-green);
}
.pp-standard-link:hover {
  color: var(--cp-green-hover);
}
.pp-standard-note >>> .mdi-icon-wrapper {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--cp-green);
}
.pp-side {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-width: 0;
}

/* Panels */
.pp-panel {
  overflow: hidden;
}
/* Editing: the lists of the fields (countries, codes, ...) are shown whole, also past the end of the panel */
.pp-panel.pp-panel-lists {
  overflow: visible;
}
.pp-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1.1rem 1.5rem;
  border: none;
  border-bottom: 1px solid var(--cp-border);
  background: transparent;
  color: var(--cp-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
/* Header with its own buttons (title + add, collapse) */
.pp-panel-heading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
}
.pp-panel-add,
.pp-panel-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
}
.pp-panel-add {
  width: 26px;
  height: 26px;
  border: 1px solid var(--cp-green);
  border-radius: 6px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.pp-panel-add:hover {
  background: var(--cp-green);
  color: var(--cp-on-button);
}
.pp-item-empty {
  color: var(--cp-muted);
  font-size: 0.9rem;
}
.pp-panel-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}
.pp-panel-chevron {
  display: inline-flex;
  color: var(--cp-muted);
  transition: transform 0.2s;
}
.pp-panel-chevron.closed {
  transform: rotate(180deg);
}

/* Overview fields */
.pp-field {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 1rem;
  padding: 0.9rem 1.5rem;
}
.pp-field + .pp-field {
  border-top: 1px solid var(--cp-border);
}
.pp-field-code {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: var(--pp-code);
}
.pp-field-label {
  margin-top: 0.15rem;
  font-size: 0.85rem;
  color: var(--cp-muted);
}
.pp-field-value {
  font-size: 1rem;
  overflow-wrap: anywhere;
}
.pp-field-value.italic {
  font-style: italic;
}
.pp-field-link {
  display: inline-flex;
  margin-left: 0.3rem;
  vertical-align: -2px;
  color: var(--cp-green);
}
.pp-field-link:hover {
  color: var(--cp-green-hover);
}
/* Long URLs are cut with "..." on one line, the full address is in the tooltip */
.pp-field-url {
  display: block;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: var(--cp-green);
}
.pp-field-url:hover {
  color: var(--cp-green-hover);
}
.pp-field-line + .pp-field-line {
  margin-top: 0.3rem;
}
.pp-panel-header-plain {
  cursor: default;
}
.pp-field-empty {
  color: var(--cp-muted);
}
/* Values that can't be changed, while editing */
.pp-field-value.pp-field-disabled {
  color: var(--cp-muted);
  opacity: 0.6;
  cursor: not-allowed;
  user-select: none;
}
/* Edit / Save changes button and collapse chevron in the Overview header */
.pp-panel-actions {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.pp-edit-button {
  padding: 0.3rem 0.7rem;
  font-size: 0.85rem;
}
/* Same colours as the + (add) buttons of the panels */
.pp-small-button.pp-edit-button-save {
  border-color: var(--cp-green);
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.pp-small-button.pp-edit-button-save:hover:not(:disabled) {
  background: var(--cp-green);
  color: var(--cp-on-button);
}
/* Cancel turns red when hovered, like the other buttons that discard something */
.pp-small-button.pp-cancel-button:hover {
  border-color: var(--danger, #dc3545);
  background: var(--danger, #dc3545);
  color: #ffffff;
}
.pp-edit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* Overview content while saving: veiled, can't be clicked or typed in */
.pp-busy {
  position: relative;
  pointer-events: none;
  user-select: none;
}
.pp-busy::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--cp-surface);
  opacity: 0.55;
  cursor: progress;
}
.pp-edit-button >>> .pp-spin,
.pp-panel-add >>> .pp-spin {
  animation: pp-spin 1s linear infinite;
}
@keyframes pp-spin {
  to {
    transform: rotate(360deg);
  }
}
.pp-clear-button {
  display: inline-flex;
  align-items: center;
}
/* STORAGE: "Add" before the tags, like the abbreviation of SUBTAXA, and the codes opening above the field */
/* MLSSTAT: two joined buttons, the chosen one in the green of the page */
.pp-switch-field {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.pp-segmented >>> .btn {
  min-width: 4.5rem;
  border-color: var(--cp-border);
  background: var(--cp-surface);
  color: var(--cp-muted);
}
.pp-segmented >>> .btn:hover {
  background: var(--cp-surface-hover);
  color: var(--cp-text);
}
.pp-segmented >>> .btn.active {
  border-color: var(--cp-green);
  background: var(--cp-green);
  color: var(--cp-on-button);
  font-weight: 600;
}
.pp-tags-field {
  position: relative;
}
.pp-tags-add {
  width: auto;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  text-align: left;
}
.pp-tags-field .input-group-sm > .form-control.pp-tags {
  height: auto;
}
.pp-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.3rem;
  height: auto;
  min-height: calc(1.5em + 0.5rem + 2px);
  padding: 0.2rem 0.4rem;
}
.pp-tags.is-invalid {
  border-color: var(--danger, #dc3545);
}
.pp-tags .pp-tag {
  margin: 0;
  max-width: 100%;
  font-size: 0.8rem;
}
.pp-tags .pp-tag >>> .b-form-tag-content {
  max-width: 16rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-tags-menu {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(100% + 0.25rem);
  z-index: 20;
  max-height: 16rem;
  overflow-y: auto;
  padding: 0.25rem 0;
  border: 1px solid var(--cp-border);
  border-radius: 8px;
  background: var(--cp-surface);
  box-shadow: 0 6px 18px var(--cp-shadow);
}
.pp-tags-option {
  display: block;
  width: 100%;
  padding: 0.35rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--cp-text);
  font-size: 0.9rem;
  text-align: left;
}
.pp-tags-option:hover,
.pp-tags-option:focus {
  background: var(--cp-surface-hover);
  outline: none;
}
.pp-tags-option .pp-code-badge,
.pp-tags-menu .pp-code-badge {
  display: inline-block;
  min-width: 2.6rem;
  margin-right: 0.5rem;
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
}
/* Countries in the list of ORIGCTY */
.pp-field-value >>> .pp-country-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}
.pp-field-value >>> .pp-country-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-field-value >>> .pp-country-code {
  flex: 0 0 auto;
  color: var(--cp-muted);
  font-size: 0.8rem;
  font-variant-numeric: tabular-nums;
}
/* Code of a coded field (SAMPSTAT, COLLSRC) in its list of values */
.pp-field-value >>> .pp-code-badge {
  display: inline-block;
  min-width: 2.6rem;
  margin-right: 0.5rem;
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  background: var(--cp-green-soft);
  color: var(--cp-green);
  font-size: 0.8rem;
  font-weight: 600;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.pp-subtaxa-rank {
  width: auto;
  max-width: 11rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
/* Suggestions of the editable fields: the panel hides what overflows it, so the list scrolls instead */
.pp-field-value >>> .vbt-autcomplete-list {
  max-height: 14rem;
  overflow-y: auto;
}

/* Map */
/* A chosen country (NICODE of the Metadata tab): flag, name and ISO code over the field, like in its list */
.pp-country-field {
  position: relative;
}
.pp-country-selected {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0.6rem;
  /* The clear button stays visible */
  right: 3rem;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  font-size: 0.875rem;
  pointer-events: none;
}
.pp-country-field.has-country >>> input.form-control {
  color: transparent;
}
/* 0/1 metadata to add: the remove button next to the buttons */
.pp-dismiss-button {
  margin-left: 0.25rem;
}
/* New metadata rows: the name field in the place of the label */
.pp-metadata-new .pp-field-label {
  margin-top: 0.25rem;
}
/* CROPSHIP of a new germplasm: the icon of the group (its crop colour) next to its name */
.pp-group-icon {
  display: inline-flex;
  align-items: center;
}
.pp-field-value >>> .pp-group-option {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
/* Location chosen for a new germplasm */
.pp-new-location {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem 0;
  font-size: 0.85rem;
  color: var(--cp-text-subtle);
}
.pp-new-location-text {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.pp-new-location-clear {
  padding: 0.25rem 0.5rem;
}
/* Change germplasm location (data curators) */
.pp-location-change {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.5rem 1.2rem;
  border-top: 1px solid var(--cp-border);
}
.pp-location-change-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cp-text-subtle);
}
.pp-location-change-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.pp-small-button {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--cp-border);
  border-radius: 8px;
  background: var(--cp-surface);
  color: var(--cp-text);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}
.pp-small-button:hover {
  background: var(--cp-surface-hover);
  border-color: var(--cp-green);
}

/* Selecting on the map: the block spans the whole row of the grid */
.pp-location-expanded {
  grid-column: 1 / -1;
}
.pp-location-hint {
  font-size: 0.85rem;
  color: var(--cp-muted);
}
/* Latitude and longitude of Select on map, side by side above the map */
.pp-map-coordinates {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0.9rem 1.5rem 0.25rem;
}
.pp-map-coordinate {
  flex: 0 1 14rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
}
.pp-map.pp-map-large >>> .location-map {
  height: 520px !important;
}
/* Unfolds from the top with a fade */
.pp-unfold-enter-active,
.pp-unfold-leave-active {
  transform-origin: top center;
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.pp-unfold-enter,
.pp-unfold-leave-to {
  opacity: 0;
  transform: translateY(-8px) scaleY(0.96);
}
@media (prefers-reduced-motion: reduce) {
  .pp-unfold-enter-active,
  .pp-unfold-leave-active {
    transition: none;
  }
}

/* Dark mode for the maps: OpenStreetMap tiles are darkened with a colour filter (other base layers such as
   satellite are left as they are), and the Leaflet controls, popups and loading background follow the dark palette */
body.dark-mode .passport-page >>> img.leaflet-tile[src*="tile.openstreetmap.org"] {
  filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9);
}
body.dark-mode .passport-page >>> .leaflet-container {
  background: var(--cp-surface);
}
body.dark-mode .passport-page >>> .leaflet-bar a,
body.dark-mode .passport-page >>> .leaflet-control-layers {
  border-color: var(--cp-border);
  background-color: var(--cp-surface);
  color: var(--cp-text);
}
body.dark-mode .passport-page >>> .leaflet-bar a:hover {
  background-color: var(--cp-surface-hover);
}
body.dark-mode .passport-page >>> .leaflet-control-layers-toggle {
  filter: invert(1);
}
body.dark-mode .passport-page >>> .leaflet-control-attribution {
  background: rgba(31, 34, 35, 0.8);
  color: var(--cp-muted);
}
body.dark-mode .passport-page >>> .leaflet-control-attribution a {
  color: var(--cp-green);
}
body.dark-mode .passport-page >>> .leaflet-popup-content-wrapper,
body.dark-mode .passport-page >>> .leaflet-popup-tip {
  background: var(--cp-surface);
  color: var(--cp-text);
}

/* The shared map component is 600px high, here it follows the size of the block */
.pp-map >>> .location-map {
  height: 260px !important;
}

/* Items of the side panels */
.pp-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.85rem 1.5rem;
}
.pp-item + .pp-item {
  border-top: 1px solid var(--cp-border);
}
.pp-item-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: #ffffff;
}
.pp-item-icon-neutral {
  background: var(--cp-green-soft);
  color: var(--cp-green);
}
.pp-item-body {
  min-width: 0;
}
.pp-item-title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.pp-item-title strong {
  margin-right: 0.3rem;
  font-weight: 600;
}
/* Rows that are links */
.pp-item-link {
  color: var(--cp-text);
  text-decoration: none;
  transition: background 0.15s;
}
.pp-item-link:hover,
.pp-item-link:focus-visible {
  background: var(--cp-surface-hover);
  color: var(--cp-text);
  text-decoration: none;
}
.pp-item-external {
  display: inline-flex;
  flex-shrink: 0;
  margin-left: auto;
  color: var(--cp-muted);
}

/* Institutions: code and type on the first line, name below */
.pp-institution {
  align-items: flex-start;
}
.pp-institution .pp-item-body {
  flex: 1 1 auto;
}
.pp-institution-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}
.pp-institution-code {
  font-weight: 600;
  white-space: nowrap;
}
.pp-institution-type {
  flex-shrink: 0;
  white-space: nowrap;
}
.pp-institution-name {
  margin-top: 0.1rem;
}
/* Editing institutions: the maintenance institution can't be changed */
.pp-institution.pp-institution-disabled {
  opacity: 0.55;
  cursor: not-allowed;
  user-select: none;
}
.pp-institution-new .pp-institution-head {
  align-items: flex-start;
}
.pp-institution-input {
  flex: 0 1 9rem;
  min-width: 0;
}
.pp-institution-input .form-control {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
/* Edit button of the institutions while editing */
.pp-panel-add.active {
  background: var(--cp-green);
  color: var(--cp-on-button);
}
.pp-panel-add:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
/* Cancel next to save: red when hovered, like the Cancel of the passport */
.pp-panel-add.pp-panel-cancel {
  border-color: var(--cp-border);
  background: var(--cp-surface);
  color: var(--cp-muted);
}
.pp-panel-add.pp-panel-cancel:hover {
  border-color: var(--danger, #dc3545);
  background: var(--danger, #dc3545);
  color: #ffffff;
}

/* Publications: year with the journal (or other source) next to it */
/* Year and source on one line, cut with "..." when too long */
.pp-publication-meta {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
/* The title link covers the whole row */
.pp-publication {
  position: relative;
}
.pp-stretched-link {
  display: block;
  color: var(--cp-text);
  text-decoration: none;
}
.pp-stretched-link:hover {
  color: var(--cp-text);
  text-decoration: none;
}
.pp-stretched-link::after {
  content: '';
  position: absolute;
  inset: 0;
}
/* Sits above the stretched link so it can be clicked */
.pp-publication-delete {
  position: relative;
  z-index: 1;
  padding: 0;
  margin-top: 0.2rem;
  border: none;
  font-size: 0.85rem;
  line-height: 1.3;
}

/* Previous / next below a list */
.pp-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--cp-border);
}
.pp-pager-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--cp-text);
  cursor: pointer;
}
.pp-pager-button:hover:not(:disabled) {
  background: var(--cp-surface-hover);
}
.pp-pager-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.pp-pager-text {
  min-width: 3.5rem;
  font-size: 0.85rem;
  color: var(--cp-muted);
  text-align: center;
}

.pp-item-subtitle {
  font-size: 0.85rem;
  color: var(--cp-muted);
}

/* Responsive */
@media (max-width: 991px) {
  .pp-tab-content {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 575px) {
  .pp-header {
    padding: 1.25rem;
  }
  .pp-header-actions {
    min-width: 0;
    width: 100%;
  }
  .pp-title {
    font-size: 1.7rem;
  }
  .pp-field {
    grid-template-columns: 1fr;
    gap: 0.35rem;
  }
}
</style>
