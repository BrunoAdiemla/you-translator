# Requirements Document

## Introduction

Esta especificação define a funcionalidade de exclusão de traduções na página de detalhes de uma tradução. O sistema permitirá que usuários excluam traduções individuais de seu histórico através de um botão de exclusão com confirmação via modal, garantindo que a ação seja intencional e proporcionando feedback adequado ao usuário.

## Glossary

- **Translation_Detail_View**: A página que exibe os detalhes completos de uma tradução específica, incluindo a frase original, tradução do usuário, correção da IA e feedback
- **Delete_Button**: Botão de interface que inicia o processo de exclusão de uma tradução
- **Confirmation_Modal**: Janela modal que solicita confirmação do usuário antes de executar a exclusão
- **Translation_Service**: Serviço responsável por operações de banco de dados relacionadas a traduções
- **History_List_View**: A página que lista todas as traduções do usuário (página "Traduções")
- **User**: Usuário autenticado do aplicativo que possui traduções salvas
- **Native_Language**: O idioma nativo configurado pelo usuário (Português, Espanhol ou Francês)

## Requirements

### Requirement 1: Botão de Exclusão na Interface

**User Story:** Como usuário, eu quero ver um botão de exclusão na página de detalhes da tradução, para que eu possa iniciar o processo de remoção de uma tradução específica.

#### Acceptance Criteria

1. WHEN a Translation_Detail_View is displayed, THE System SHALL render a Delete_Button below the translation details
2. THE Delete_Button SHALL display text in the User's Native_Language (Português, Espanhol ou Francês)
3. THE Delete_Button SHALL be visually distinct and clearly indicate its destructive action through styling
4. WHEN the Delete_Button is clicked, THE System SHALL open the Confirmation_Modal

### Requirement 2: Modal de Confirmação

**User Story:** Como usuário, eu quero confirmar a exclusão antes que ela aconteça, para que eu não exclua acidentalmente uma tradução importante.

#### Acceptance Criteria

1. WHEN the Delete_Button is clicked, THE System SHALL display a Confirmation_Modal
2. THE Confirmation_Modal SHALL display a confirmation message in the User's Native_Language
3. THE Confirmation_Modal SHALL provide two action buttons: confirm and cancel
4. THE Confirmation_Modal SHALL display button labels in the User's Native_Language
5. WHEN the cancel button is clicked, THE System SHALL close the Confirmation_Modal without deleting the translation
6. WHEN the confirm button is clicked, THE System SHALL proceed with the deletion process

### Requirement 3: Exclusão da Tradução

**User Story:** Como usuário, eu quero que a tradução seja permanentemente removida do banco de dados quando eu confirmar a exclusão, para que meu histórico reflita apenas as traduções que desejo manter.

#### Acceptance Criteria

1. WHEN the User confirms deletion in the Confirmation_Modal, THE Translation_Service SHALL delete the translation from the database
2. IF the deletion is successful, THE System SHALL navigate the User to the History_List_View
3. IF the deletion fails, THE System SHALL display an error message in the User's Native_Language
4. WHEN deletion fails, THE System SHALL keep the User on the Translation_Detail_View
5. THE System SHALL only delete the specific translation identified by its unique ID

### Requirement 4: Suporte Multilíngue

**User Story:** Como usuário que fala Português, Espanhol ou Francês, eu quero que todos os textos relacionados à exclusão apareçam no meu idioma nativo, para que eu possa entender claramente as ações que estou realizando.

#### Acceptance Criteria

1. WHEN the Native_Language is Português, THE System SHALL display all deletion-related text in Portuguese
2. WHEN the Native_Language is Espanhol, THE System SHALL display all deletion-related text in Spanish
3. WHEN the Native_Language is Francês, THE System SHALL display all deletion-related text in French
4. THE System SHALL use the existing translations structure for all new text strings
5. THE System SHALL include translations for: delete button label, confirmation message, confirm button, cancel button, success message, and error message

### Requirement 5: Navegação e Feedback

**User Story:** Como usuário, eu quero ser redirecionado para a lista de traduções após uma exclusão bem-sucedida, para que eu possa continuar navegando pelo meu histórico.

#### Acceptance Criteria

1. WHEN a translation is successfully deleted, THE System SHALL navigate to the History_List_View
2. THE System SHALL use the existing navigation mechanism (React Router)
3. WHEN navigation occurs, THE History_List_View SHALL display the updated list without the deleted translation
4. IF an error occurs during deletion, THE System SHALL display an error message without navigating away
5. THE System SHALL close the Confirmation_Modal after the deletion attempt completes
