from flask import Blueprint, request, jsonify
import os
import json
from datetime import datetime

issues_bp = Blueprint('issues', __name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
ISSUES_FILE = os.path.join(PROJECT_ROOT, "claudeproject", "data", "issues.json")

def _read_issues():
    """Read all issues from the issues file"""
    try:
        if os.path.exists(ISSUES_FILE):
            with open(ISSUES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error reading issues file: {e}")
        return []

def _write_issues(issues):
    """Write issues to the issues file"""
    try:
        # Ensure directory exists
        os.makedirs(os.path.dirname(ISSUES_FILE), exist_ok=True)
        
        with open(ISSUES_FILE, 'w', encoding='utf-8') as f:
            json.dump(issues, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error writing issues file: {e}")
        return False

@issues_bp.route('/report', methods=['POST'])
def report_issue():
    """Submit a new issue report"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['pincode', 'issue_type', 'description', 'reporter_name']
        for field in required_fields:
            if not data.get(field) or data.get(field).strip() == '':
                return jsonify({'error': f'{field} is required'}), 400
        
        # Validate issue type
        valid_issue_types = [
            'waterlogging', 'drainage_blockage', 'flood_damage', 
            'infrastructure_issue', 'prediction_error', 'other'
        ]
        if data['issue_type'] not in valid_issue_types:
            return jsonify({'error': 'Invalid issue type'}), 400
        
        # Create issue record
        issue = {
            'id': f"issue_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'pincode': data['pincode'].strip(),
            'district': data.get('district', ''),
            'state': data.get('state', ''),
            'issue_type': data['issue_type'],
            'description': data['description'].strip(),
            'severity': data.get('severity', 'medium'),
            'reporter_name': data['reporter_name'].strip(),
            'reporter_contact': data.get('reporter_contact', '').strip(),
            'location_details': data.get('location_details', '').strip(),
            'status': 'pending',
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        # Read existing issues
        issues = _read_issues()
        
        # Add new issue
        issues.append(issue)
        
        # Save to file
        if _write_issues(issues):
            return jsonify({
                'success': True,
                'message': 'Issue reported successfully',
                'issue_id': issue['id']
            }), 200
        else:
            return jsonify({'error': 'Failed to save issue'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@issues_bp.route('/list', methods=['GET'])
def list_issues():
    """Get all issues (for admin/planner view)"""
    try:
        # Filter parameters
        pincode_filter = request.args.get('pincode', '')
        status_filter = request.args.get('status', '')
        
        issues = _read_issues()
        
        # Apply filters
        if pincode_filter:
            issues = [issue for issue in issues if issue['pincode'] == pincode_filter]
        
        if status_filter:
            issues = [issue for issue in issues if issue['status'] == status_filter]
        
        # Sort by creation date (newest first)
        issues.sort(key=lambda x: x['created_at'], reverse=True)
        
        return jsonify({
            'success': True,
            'issues': issues,
            'total': len(issues)
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@issues_bp.route('/<issue_id>/update', methods=['PUT'])
def update_issue_status(issue_id):
    """Update issue status (for admin/planner)"""
    try:
        data = request.get_json()
        
        if 'status' not in data:
            return jsonify({'error': 'Status is required'}), 400
        
        valid_statuses = ['pending', 'in_progress', 'resolved', 'rejected']
        if data['status'] not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        # Read issues
        issues = _read_issues()
        
        # Find and update issue
        issue_found = False
        for issue in issues:
            if issue['id'] == issue_id:
                issue['status'] = data['status']
                issue['updated_at'] = datetime.now().isoformat()
                if 'admin_notes' in data:
                    issue['admin_notes'] = data['admin_notes']
                issue_found = True
                break
        
        if not issue_found:
            return jsonify({'error': 'Issue not found'}), 404
        
        # Save changes
        if _write_issues(issues):
            return jsonify({
                'success': True,
                'message': 'Issue updated successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to save changes'}), 500
            
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@issues_bp.route('/by-pincode/<pincode>', methods=['GET'])
def get_issues_by_pincode(pincode):
    """Get all issues for a specific pincode"""
    try:
        issues = _read_issues()
        
        # Filter issues by pincode
        pincode_issues = [issue for issue in issues if issue['pincode'] == pincode]
        
        # Sort by creation date (newest first)
        pincode_issues.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Calculate impact score for this pincode
        impact_score = _calculate_impact_score(pincode_issues)
        
        return jsonify({
            'success': True,
            'issues': pincode_issues,
            'total': len(pincode_issues),
            'impact_score': impact_score
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

def _calculate_impact_score(issues):
    """Calculate impact score based on reported issues"""
    if not issues:
        return 0
    
    total_score = 0
    
    # Weight by severity
    severity_weights = {
        'low': 1,
        'medium': 3,
        'high': 5,
        'critical': 8
    }
    
    # Weight by issue type
    type_weights = {
        'waterlogging': 3,
        'drainage_blockage': 4,
        'flood_damage': 5,
        'infrastructure_issue': 3,
        'prediction_error': 2,
        'other': 1
    }
    
    # Consider recency (more recent issues have higher weight)
    from datetime import datetime, timedelta
    
    for issue in issues:
        # Base score from severity and type
        severity_weight = severity_weights.get(issue.get('severity', 'medium'), 3)
        type_weight = type_weights.get(issue.get('issue_type', 'other'), 1)
        
        # Recency factor (issues within last 7 days get 2x weight, within 30 days get 1.5x)
        created_at = datetime.fromisoformat(issue.get('created_at', ''))
        now = datetime.now()
        days_ago = (now - created_at).days
        
        recency_factor = 1.0
        if days_ago <= 7:
            recency_factor = 2.0
        elif days_ago <= 30:
            recency_factor = 1.5
        
        # Calculate contribution
        contribution = severity_weight * type_weight * recency_factor
        total_score += contribution
    
    return min(total_score, 100)  # Cap at 100

@issues_bp.route('/district/<state>/<district>', methods=['GET'])
def get_district_issues(state, district):
    """Get all issues for a specific district"""
    try:
        issues = _read_issues()
        
        # Filter issues by state and district
        district_issues = [
            issue for issue in issues 
            if issue['state'].lower() == state.lower() and 
               issue['district'].lower() == district.lower()
        ]
        
        # Sort by creation date (newest first)
        district_issues.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Calculate statistics for this district
        stats = {
            'total': len(district_issues),
            'pending': len([i for i in district_issues if i.get('status') == 'pending']),
            'in_progress': len([i for i in district_issues if i.get('status') == 'in_progress']),
            'solved': len([i for i in district_issues if i.get('status') == 'solved']),
            'critical': len([i for i in district_issues if i.get('severity') == 'critical']),
            'high': len([i for i in district_issues if i.get('severity') == 'high']),
            'medium': len([i for i in district_issues if i.get('severity') == 'medium']),
            'low': len([i for i in district_issues if i.get('severity') == 'low'])
        }
        
        return jsonify({
            'success': True,
            'issues': district_issues,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@issues_bp.route('/<issue_id>/status', methods=['PUT'])
def update_issue_status_new(issue_id):
    """Update issue status (mark as solved, in progress, etc.)"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        notes = data.get('notes', '')
        
        if new_status not in ['pending', 'in_progress', 'solved']:
            return jsonify({'error': 'Invalid status'}), 400
        
        issues = _read_issues()
        
        # Find and update the issue
        for issue in issues:
            if issue['id'] == issue_id:
                issue['status'] = new_status
                issue['status_updated_at'] = datetime.now().isoformat()
                issue['status_notes'] = notes
                
                # Write back to file
                _write_issues(issues)
                
                return jsonify({
                    'success': True,
                    'message': f'Issue marked as {new_status}',
                    'issue': issue
                }), 200
        
        return jsonify({'error': 'Issue not found'}), 404
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

@issues_bp.route('/stats', methods=['GET'])
def get_issue_stats():
    """Get issue statistics for dashboard"""
    try:
        issues = _read_issues()
        
        stats = {
            'total_issues': len(issues),
            'by_status': {},
            'by_type': {},
            'by_severity': {},
            'recent_issues': []
        }
        
        # Calculate statistics
        for issue in issues:
            # By status
            status = issue.get('status', 'pending')
            stats['by_status'][status] = stats['by_status'].get(status, 0) + 1
            
            # By type
            issue_type = issue.get('issue_type', 'other')
            stats['by_type'][issue_type] = stats['by_type'].get(issue_type, 0) + 1
            
            # By severity
            severity = issue.get('severity', 'medium')
            stats['by_severity'][severity] = stats['by_severity'].get(severity, 0) + 1
        
        # Get recent issues (last 5)
        stats['recent_issues'] = sorted(issues, key=lambda x: x['created_at'], reverse=True)[:5]
        
        return jsonify({
            'success': True,
            'stats': stats
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500
