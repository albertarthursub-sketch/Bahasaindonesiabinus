import { useState, useEffect } from 'react';
import { 
  getAllTeacherResources, 
  saveTeacherResource, 
  deleteTeacherResource,
  updateTeacherResource,
  getAllVocabularyLists 
} from '../lib/firebaseStorage';

function TeacherResources() {
  const [resources, setResources] = useState([]);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingResourceId, setEditingResourceId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'lesson_plan',
    content: '',
    listId: '',
    tags: ''
  });

  useEffect(() => {
    loadResources();
    loadLists();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await getAllTeacherResources();
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
      alert('Error loading resources');
    } finally {
      setLoading(false);
    }
  };

  const loadLists = async () => {
    try {
      const data = await getAllVocabularyLists();
      setLists(data);
    } catch (error) {
      console.error('Error loading lists:', error);
    }
  };

  const handleSaveResource = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }

    try {
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);

      if (editingResourceId) {
        // Update existing resource
        await updateTeacherResource(editingResourceId, {
          title: formData.title,
          type: formData.type,
          content: formData.content,
          listId: formData.listId || null,
          tags: tags
        });
        console.log('✅ Resource updated successfully');
      } else {
        // Create new resource
        await saveTeacherResource(
          formData.title,
          formData.type,
          formData.content,
          formData.listId || null,
          tags
        );
        console.log('✅ Resource created successfully');
      }

      setFormData({
        title: '',
        type: 'lesson_plan',
        content: '',
        listId: '',
        tags: ''
      });
      setEditingResourceId(null);
      setShowCreateModal(false);
      loadResources();
      alert(editingResourceId ? 'Resource updated successfully!' : 'Resource saved successfully!');
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Error saving resource');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!confirm('Delete this resource?')) return;

    try {
      await deleteTeacherResource(resourceId);
      loadResources();
      alert('Resource deleted');
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource');
    }
  };

  const handleEditResource = (resource) => {
    setFormData({
      title: resource.title,
      type: resource.type,
      content: resource.content,
      listId: resource.listId || '',
      tags: resource.tags ? resource.tags.join(', ') : ''
    });
    setEditingResourceId(resource.id);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingResourceId(null);
    setFormData({
      title: '',
      type: 'lesson_plan',
      content: '',
      listId: '',
      tags: ''
    });
  };

  const filteredResources = resources.filter(resource => {
    const typeMatch = filterType === 'all' || resource.type === filterType;
    const searchMatch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (resource.content && resource.content.toLowerCase().includes(searchTerm.toLowerCase()));
    return typeMatch && searchMatch;
  });

  const getTypeIcon = (type) => {
    const icons = {
      'lesson_plan': '📖',
      'notes': '📝',
      'worksheet': '📄',
      'assessment': '✅',
      'activity': '🎮',
      'video': '🎥',
      'audio': '🔊',
      'other': '📌'
    };
    return icons[type] || '📌';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'lesson_plan': 'Lesson Plan',
      'notes': 'Teacher Notes',
      'worksheet': 'Worksheet',
      'assessment': 'Assessment',
      'activity': 'Activity',
      'video': 'Video',
      'audio': 'Audio',
      'other': 'Other'
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">📚 Teacher Resources</h1>
              <p className="text-gray-600">Organize lesson plans, notes, worksheets, and materials</p>
            </div>
            <a href="/teacher" className="btn btn-gray">← Dashboard</a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search resources..."
                className="input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="input md:w-40"
            >
              <option value="all">All Types</option>
              <option value="lesson_plan">Lesson Plans</option>
              <option value="notes">Notes</option>
              <option value="worksheet">Worksheets</option>
              <option value="assessment">Assessments</option>
              <option value="activity">Activities</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="other">Other</option>
            </select>

            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-blue whitespace-nowrap"
            >
              + New Resource
            </button>
          </div>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading resources...</p>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No resources found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map(resource => (
              <div key={resource.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{getTypeIcon(resource.type)}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg leading-tight">{resource.title}</h3>
                      <p className="text-xs text-gray-600">{getTypeLabel(resource.type)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteResource(resource.id)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    🗑️
                  </button>
                </div>

                <div className="mb-3 line-clamp-3 text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {resource.content}
                </div>

                {resource.listId && (
                  <div className="text-xs text-blue-600 mb-2">
                    📚 Linked to list
                  </div>
                )}

                {resource.tags && resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {resource.tags.map((tag, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {new Date(resource.createdAt).toLocaleDateString()}
                </div>

                <button className="mt-3 btn btn-blue w-full text-sm" onClick={() => handleEditResource(resource)}>
                  ✏️ View & Edit
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Resource Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full my-8 p-6">
            <h2 className="text-2xl font-bold mb-6">
              {editingResourceId ? '✏️ Edit Resource' : 'Create New Resource'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Resource Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Lesson 1: Basic Greetings"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Resource Type</label>
                <select
                  className="input"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="lesson_plan">Lesson Plan</option>
                  <option value="notes">Teacher Notes</option>
                  <option value="worksheet">Worksheet</option>
                  <option value="assessment">Assessment</option>
                  <option value="activity">Activity</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Link to Vocabulary List (Optional)</label>
                <select
                  className="input"
                  value={formData.listId}
                  onChange={(e) => setFormData({ ...formData, listId: e.target.value })}
                >
                  <option value="">None</option>
                  {lists.map(list => (
                    <option key={list.id} value={list.id}>
                      {list.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Content</label>
                <textarea
                  className="input"
                  rows="8"
                  placeholder="Enter your resource content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., grammar, vocabulary, practice"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="btn btn-gray flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveResource}
                  className="btn btn-blue flex-1"
                >
                  {editingResourceId ? 'Update Resource' : 'Save Resource'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherResources;
