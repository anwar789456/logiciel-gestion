# Instructions for Adding Missing Translations

## Missing Translation Keys

The following translation keys need to be added to your i18n.js file:

1. `warning_sublinks_update`
2. `auto_generate`
3. `full_path`
4. `parent_category`
5. Plus several other related keys for the improved Categories page

## How to Add the Translations

1. Open your i18n.js file
2. Add the English translations in the English section (around line 487, after `subcategory_href`)
3. Add the French translations in the French section (around line 1115, after `subcategory_href`)

## English Translations to Add

```javascript
'href_manual': 'Manual URL entry mode',
'auto_generate': 'Auto-generate',
'warning_sublinks_update': 'Changing this will update all subcategory URLs',
'full_path': 'Full path',
'parent_category': 'Parent category',
'preview_category': 'Category Preview',
'desktop_preview': 'Preview',
'no_image': 'No image',
'more_items': 'more items',
'disable_auto_generate': 'Disable automatic URL generation',
'enable_auto_generate': 'Enable automatic URL generation',
'category_added_success': 'Category "{{title}}" added successfully',
'category_updated_success': 'Category "{{title}}" updated successfully',
'category_deleted_success': 'Category "{{title}}" deleted successfully',
'subcategory_deleted_success': 'Subcategory "{{title}}" deleted successfully',
'category_shown_success': 'Category "{{title}}" is now visible',
'category_hidden_success': 'Category "{{title}}" is now hidden',
'subcategory_shown_success': 'Subcategory "{{title}}" is now visible',
'subcategory_hidden_success': 'Subcategory "{{title}}" is now hidden',
'error_updating_visibility': 'Error updating visibility status',
'error_deleting_category': 'Error deleting category',
'bulk_show_success': '{{count}} categories are now visible',
'bulk_hide_success': '{{count}} categories are now hidden',
'selected_items': '{{count}} items selected',
'cancel_selection': 'Cancel selection',
'show_all_selected': 'Show all selected',
'hide_all_selected': 'Hide all selected',
'bulk_actions': 'Bulk actions',
'preview': 'Preview',
```

## French Translations to Add

```javascript
'href_manual': 'Mode de saisie manuelle d\'URL',
'auto_generate': 'Générer automatiquement',
'warning_sublinks_update': 'La modification de ceci mettra à jour toutes les URL des sous-catégories',
'full_path': 'Chemin complet',
'parent_category': 'Catégorie parente',
'preview_category': 'Aperçu de la catégorie',
'desktop_preview': 'Aperçu',
'no_image': 'Pas d\'image',
'more_items': 'éléments supplémentaires',
'disable_auto_generate': 'Désactiver la génération automatique d\'URL',
'enable_auto_generate': 'Activer la génération automatique d\'URL',
'category_added_success': 'Catégorie "{{title}}" ajoutée avec succès',
'category_updated_success': 'Catégorie "{{title}}" mise à jour avec succès',
'category_deleted_success': 'Catégorie "{{title}}" supprimée avec succès',
'subcategory_deleted_success': 'Sous-catégorie "{{title}}" supprimée avec succès',
'category_shown_success': 'Catégorie "{{title}}" est maintenant visible',
'category_hidden_success': 'Catégorie "{{title}}" est maintenant cachée',
'subcategory_shown_success': 'Sous-catégorie "{{title}}" est maintenant visible',
'subcategory_hidden_success': 'Sous-catégorie "{{title}}" est maintenant cachée',
'error_updating_visibility': 'Erreur lors de la mise à jour de la visibilité',
'error_deleting_category': 'Erreur lors de la suppression de la catégorie',
'bulk_show_success': '{{count}} catégories sont maintenant visibles',
'bulk_hide_success': '{{count}} catégories sont maintenant cachées',
'selected_items': '{{count}} éléments sélectionnés',
'cancel_selection': 'Annuler la sélection',
'show_all_selected': 'Afficher tous les éléments sélectionnés',
'hide_all_selected': 'Masquer tous les éléments sélectionnés',
'bulk_actions': 'Actions groupées',
'preview': 'Aperçu',
```
